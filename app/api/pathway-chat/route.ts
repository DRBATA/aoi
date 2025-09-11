import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';

// Helper function to get experience name
async function getExperienceName(experienceId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const { data } = await supabase
    .from('experiences')
    .select('name')
    .eq('id', experienceId)
    .single();
  return data?.name || 'Experience';
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// AI enrichment function using pathway descriptions
interface Suggestion {
  pathway_id: string;
  pathway_name: string;
  pathway_description: string;
  [key: string]: unknown;
}

async function enrichSuggestionsWithAI(suggestions: Suggestion[], selectedExperienceName: string) {
  if (suggestions.length === 0) return suggestions;
  
  // Group suggestions by pathway for context separation
  const pathwayGroups: { [key: string]: { pathway_name: string; pathway_description: string; chips: Suggestion[] } } = {};
  
  suggestions.forEach(suggestion => {
    const pathwayId = suggestion.pathway_id;
    if (!pathwayGroups[pathwayId]) {
      pathwayGroups[pathwayId] = {
        pathway_name: suggestion.pathway_name,
        pathway_description: suggestion.pathway_description,
        chips: []
      };
    }
    pathwayGroups[pathwayId].chips.push(suggestion);
  });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_completion_tokens: 1400,
      messages: [{
        role: "system",
        content: "You explain pathway sequences using ONLY the provided pathway descriptions. Create explanations with summary + detailed parts. For drinks, pick ONE drink per timing field (pre/during/after) from the pathway data if available."
      }, {
        role: "user",
        content: `Selected Experience: ${selectedExperienceName}

Pathway Groups: ${JSON.stringify(pathwayGroups, null, 2)}

For each chip:
1. Create explanation with summary (max 80 chars) + detailed explanation
2. Pick ONE drink per timing field from pathway data (if drinks exist)
3. Use ONLY pathway_description content
4. Use position-based chip_id format: "-1_experience_id" (before), "+1_experience_id" (after), "+2_experience_id" (second after)

Return JSON: {
  "enriched_chips": [
    {
      "chip_id": "-1_experience_id or +1_experience_id or combo_experience_id",
      "summary": "Brief summary for chip display",
      "explanation": "Detailed explanation for email",
      "selected_pre_drink": null,
      "selected_during_drink": null, 
      "selected_after_drink": null
    }
  ]
}`
      }]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return suggestions;

    const aiResult = JSON.parse(content);
    
    // Merge AI enrichment back into suggestions
    suggestions.forEach(suggestion => {
      // Create position-based chip ID
      let position = '';
      if (suggestion.timing === 'before') position = '-1';
      else if (suggestion.timing === 'after') position = '+1';
      else if (suggestion.timing === 'combo') position = 'combo';
      
      const chipId = `${position}_${suggestion.experience_id}`;
      const enrichedChip = aiResult.enriched_chips?.find((c: { chip_id: string; summary?: string; explanation?: string; selected_pre_drink?: string; selected_during_drink?: string; selected_after_drink?: string }) => c.chip_id === chipId);
      
      if (enrichedChip) {
        suggestion.summary = enrichedChip.summary || suggestion.reason;
        suggestion.explanation = enrichedChip.explanation || suggestion.reason;
        suggestion.reason = enrichedChip.summary || suggestion.reason; // Keep for backward compatibility
        suggestion.selected_pre_drink = enrichedChip.selected_pre_drink;
        suggestion.selected_during_drink = enrichedChip.selected_during_drink;
        suggestion.selected_after_drink = enrichedChip.selected_after_drink;
      }
    });

    return suggestions;
  } catch (error) {
    console.error('[pathway-chat] AI enrichment error:', error);
    return suggestions; // Return original suggestions if AI fails
  }
}


export async function POST(req: Request) {
  try {
    const { 
      selected_experience_id, 
      selected_time, 
      customer_email,
      pathway_id,
      get_drinks_only = false
    } = await req.json();
    
    const supabase = await createClient();

    // Handle drinks-only request for specific pathway
    if (get_drinks_only && pathway_id) {
      const { data: pathway } = await supabase
        .from('experience_pathways')
        .select('sequence')
        .eq('id', pathway_id)
        .single();

      if (pathway && pathway.sequence) {
        // Find the step that matches the selected experience
        const step = pathway.sequence.find((s: { experience_id: string }) => 
          s.experience_id === selected_experience_id
        );
        
        if (step) {
          return NextResponse.json({
            pre_drinks: step.pre_drinks || [],
            during_drinks: step.during_drinks || [],
            after_drinks: step.after_drinks || []
          });
        }
      }
      
      return NextResponse.json({
        pre_drinks: [],
        during_drinks: [],
        after_drinks: []
      });
    }

    // If an experience is selected, return suggestion chips
    if (selected_experience_id) {
      console.log('Fetching suggestions for experience:', selected_experience_id, 'at time:', selected_time);
      
      const { data: pathways } = await supabase
        .from('experience_pathways')
        .select('id, display_name, name, Description, sequence, duration_minutes, venue_id');

      console.log('Found pathways:', pathways?.length);
      const suggestions: Record<string, unknown>[] = [];
      let beforeCount = 0;
      let afterCount = 0;
      let comboCount = 0;
      
      // Get selected experience name for AI
      let selectedExperienceName = '';
      
      // Find pathways containing this experience (allow multiple suggestions)
      for (const pathway of pathways || []) {
        const sequence = pathway.sequence;
        console.log('Checking pathway:', pathway.display_name, 'sequence:', JSON.stringify(sequence));
        const experienceIndex = sequence.findIndex((step: { experience_id: string }) => step.experience_id === selected_experience_id);
        console.log('Experience index in', pathway.display_name, ':', experienceIndex);
        
        if (experienceIndex !== -1) {
          console.log('Found experience in pathway:', pathway.display_name);
          
          // Get selected experience name
          if (!selectedExperienceName) {
            selectedExperienceName = sequence[experienceIndex].experience_name;
          }
          
          // Pre-session suggestion (allow up to 2)
          if (experienceIndex > 0 && beforeCount < 2) {
            const preStep = sequence[experienceIndex - 1];
            suggestions.push({
              kind: "experience_add",
              timing: "before",
              experience_id: preStep.experience_id,
              experience_name: preStep.experience_name,
              duration: preStep.duration,
              label: `Add ${preStep.experience_name} before (${preStep.duration}min)`,
              reason: "", // Will be filled by AI
              pathway_color: '#3B82F6',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.Description,
              chip_id: `-1_${preStep.experience_id}`
            });
            beforeCount++;
          }

          // Post-session suggestion (allow up to 2)
          if (experienceIndex < sequence.length - 1 && afterCount < 2) {
            const postStep = sequence[experienceIndex + 1];
            suggestions.push({
              kind: "experience_add",
              timing: "after",
              experience_id: postStep.experience_id,
              experience_name: postStep.experience_name,
              duration: postStep.duration,
              label: `Add ${postStep.experience_name} after (${postStep.duration}min)`,
              reason: "", // Will be filled by AI
              pathway_color: '#10B981',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.Description,
              chip_id: `+${afterCount + 1}_${postStep.experience_id}`
            });
            afterCount++;
          }

          // Combo suggestion - generate if we have both before and after options
          if (beforeCount > 0 && afterCount > 0 && comboCount === 0) {
            // Find the most recent before and after suggestions for this pathway
            const beforeSuggestion = suggestions.find(s => 
              s.timing === 'before' && s.pathway_id === pathway.id
            );
            const afterSuggestion = suggestions.find(s => 
              s.timing === 'after' && s.pathway_id === pathway.id
            );
            
            if (beforeSuggestion && afterSuggestion) {
              // For Activate Maxi pathway, get the actual before/after from sequence
              const beforeStep = sequence[experienceIndex - 1];
              const afterStep = sequence[experienceIndex + 1];
              
              suggestions.push({
                kind: "experience_combo",
                timing: "combo",
                pre_experience_id: beforeStep ? beforeStep.experience_id : beforeSuggestion.experience_id,
                pre_experience_name: beforeStep ? (await getExperienceName(beforeStep.experience_id, supabase)) : beforeSuggestion.experience_name,
                post_experience_id: afterStep ? afterStep.experience_id : afterSuggestion.experience_id,
                post_experience_name: afterStep ? (await getExperienceName(afterStep.experience_id, supabase)) : afterSuggestion.experience_name,
                label: `Complete ${pathway.display_name}: ${beforeStep ? (await getExperienceName(beforeStep.experience_id, supabase)) : beforeSuggestion.experience_name} + ${afterStep ? (await getExperienceName(afterStep.experience_id, supabase)) : afterSuggestion.experience_name}`,
                total_duration: (beforeStep ? beforeStep.duration : (beforeSuggestion.duration as number)) + sequence[experienceIndex].duration + (afterStep ? afterStep.duration : (afterSuggestion.duration as number)),
                pathway_color: '#F59E0B',
                pathway_name: pathway.display_name,
                pathway_id: pathway.id,
                pathway_description: pathway.Description,
                pre_drinks: beforeStep?.pre_drinks || [],
                during_drinks: sequence[experienceIndex]?.during_drinks || [],
                after_drinks: afterStep?.after_drinks || [],
                chip_id: `combo_${pathway.id}`
              });
              comboCount++;
            }
          }
        }
      }

      // Always use AI enrichment for better explanations
      console.log('Enriching suggestions with AI...');
      const enrichedSuggestions = await enrichSuggestionsWithAI(suggestions as Suggestion[], selectedExperienceName);
      console.log('AI enrichment complete');
      
      return NextResponse.json(enrichedSuggestions);
    }

    // Original pathway/drink recommendation logic
    const today = new Date().toISOString().split('T')[0];
    
    // Check existing bookings for this customer today
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select(`
        id,
        experience_id,
        slot_time,
        experience_name,
        booking_status,
        pathway_id
      `)
      .eq('customer_email', customer_email)
      .gte('slot_time', `${today}T00:00:00`)
      .lt('slot_time', `${today}T23:59:59`)
      .order('slot_time');

    // Remove fallback to all pathways - we want to use the filtered suggestions above
    // The suggestions array already contains the relevant before/after/combo options

    // If bookings exist, show drink recommendations based on pathway
    const pathwayId = existingBookings?.[0]?.pathway_id;
    
    if (pathwayId) {
        const { data: pathway } = await supabase
          .from('experience_pathways')
          .select('*')
          .eq('id', pathwayId)
          .single();

        if (pathway) {
          const recommendations: Array<{
    kind: string;
    id: string;
    label: string;
    booking_id?: string;
    timing?: string;
    reason?: string;
    quantity?: number;
  }> = [];
          
          // Add drinks for each booking based on pathway sequence
          existingBookings?.forEach((booking: {id: string, experience_name: string}, index: number) => {
            const sequenceStep = pathway.sequence[index];
            if (sequenceStep) {
              // Pre drinks
              sequenceStep.pre_drinks?.forEach((drink: Record<string, unknown>) => {
                recommendations.push({
                  kind: "drink",
                  id: drink.product_id as string,
                  label: `${drink.name as string} (before ${booking.experience_name})`,
                  booking_id: booking.id,
                  timing: "pre",
                  reason: (drink.reason as string) || `Optimal before ${booking.experience_name}`
                });
              });

              // During drinks
              sequenceStep.during_drinks?.forEach((drink: Record<string, unknown>) => {
                recommendations.push({
                  kind: "drink",
                  id: drink.product_id as string,
                  label: `${drink.name as string} (during ${booking.experience_name})`,
                  booking_id: booking.id,
                  timing: "during",
                  reason: `Perfect companion for ${booking.experience_name}`
                });
              });

              // After drinks (only for last booking)
              if (index === (existingBookings?.length || 0) - 1) {
                sequenceStep.after_drinks?.forEach((drink: Record<string, unknown>) => {
                  recommendations.push({
                    kind: "drink",
                    id: drink.product_id as string,
                    label: `${drink.name as string} (after session)`,
                    booking_id: booking.id,
                    timing: "after",
                    reason: "Perfect recovery drink"
                  });
                });

                // Add takeaway drinks
                pathway.takeaway?.forEach((drink: Record<string, unknown>) => {
                  recommendations.push({
                    kind: "takeaway",
                    id: drink.product_id as string,
                    label: `${drink.name as string} x${drink.quantity as number} (take home)`,
                    booking_id: booking.id,
                    timing: "takeaway",
                    quantity: drink.quantity as number,
                    reason: "Continue your journey at home"
                  });
                });
              }
            }
          });

          return NextResponse.json({
            title: `Drinks for your ${pathway.display_name} journey`,
            type: "drink_recommendations",
            pathway: pathway.display_name,
            bookings: existingBookings?.length || 0,
            choices: recommendations
          });
        }
      }

      // Fallback - show individual experience drinks
      const bookingPromises = existingBookings?.map(async (booking: {id: string, experience_name: string, slot_time: string}) => {
        return {
          kind: "booking",
          id: booking.id,
          label: `Add drinks to ${booking.experience_name} (${new Date(booking.slot_time).toLocaleTimeString()})`,
          experience: booking.experience_name,
          time: booking.slot_time
        }
      }) || [];
      const bookingChoices = await Promise.all(bookingPromises);
      return NextResponse.json({
        title: "Add drinks to your bookings",
        type: "individual_drinks",
        choices: bookingChoices
      });

    return NextResponse.json({
      title: "No recommendations available",
      choices: []
    });

  } catch (error) {
    console.error('Pathway chat error:', error);
    return NextResponse.json({ 
      error: "Failed to get recommendations" 
    }, { status: 500 });
  }
}

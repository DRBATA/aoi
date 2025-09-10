import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

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
      max_completion_tokens: 1000,
      messages: [{
        role: "system",
        content: "You explain pathway sequences using ONLY the provided pathway descriptions. Do not add external wellness knowledge. Use the pathway description to explain why experiences work in sequence."
      }, {
        role: "user",
        content: `Selected Experience: ${selectedExperienceName}

Pathway Groups: ${JSON.stringify(pathwayGroups, null, 2)}

For each chip, use ONLY the pathway_description to explain why the suggested experience works before/after the selected experience based on the chip timing. Keep explanations concise and scientific based on the pathway description content.

Return JSON: {"enriched_reasons": [{"chip_id": "string", "reason": "string"}]}`
      }]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return suggestions;

    const aiResult = JSON.parse(content);
    
    // Merge AI explanations back into suggestions
    suggestions.forEach(suggestion => {
      const chipId = `${suggestion.timing}-${suggestion.experience_id}`;
      const enrichedSuggestion = suggestions.find((s: Suggestion) => s.pathway_id === suggestion.pathway_id);
      const reason = aiResult.enriched_reasons?.find((r: { chip_id: string; reason?: string }) => r.chip_id === chipId)?.reason;
      if (enrichedSuggestion && reason) {
        suggestion.reason = reason;
      }
    });

    return suggestions;
  } catch (error) {
    console.error('[pathway-chat] AI enrichment error:', error);
    return suggestions; // Return original suggestions if AI fails
  }
}

// Generate pathway reasoning from display name (fallback only)
function generatePathwayReason(displayName: string, timing: 'before' | 'after', experienceName: string): string {
  const name = displayName.toLowerCase();
  
  if (name.includes('activate')) {
    return timing === 'before' ? 
      `Prime your system for activation with ${experienceName}` : 
      `Complete the activation sequence with ${experienceName}`;
  }
  
  if (name.includes('integration')) {
    return timing === 'before' ? 
      `Prepare for deep integration with ${experienceName}` : 
      `Seal the integration process with ${experienceName}`;
  }
  
  if (name.includes('reset')) {
    return timing === 'before' ? 
      `Begin the reset protocol with ${experienceName}` : 
      `Complete the reset cycle with ${experienceName}`;
  }
  
  if (name.includes('implosion')) {
    return timing === 'before' ? 
      `Prepare for implosion therapy with ${experienceName}` : 
      `Maximize implosion benefits with ${experienceName}`;
  }
  
  if (name.includes('contrast')) {
    return timing === 'before' ? 
      `Set up contrast therapy with ${experienceName}` : 
      `Complete the contrast cycle with ${experienceName}`;
  }
  
  // Fallback
  return timing === 'before' ? 
    `Perfect preparation with ${experienceName}` : 
    `Optimal recovery with ${experienceName}`;
}

export async function POST(req: Request) {
  try {
    const { 
      selected_experience_id, 
      selected_time, 
      ai_enrich = false,
      customer_email,
      pathway_id,
      get_drinks_only = false
    } = await req.json();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
            const pathwayReason = generatePathwayReason(pathway.display_name, 'before', preStep.experience_name);
            suggestions.push({
              kind: "experience_add",
              timing: "before",
              experience_id: preStep.experience_id,
              experience_name: preStep.experience_name,
              duration: preStep.duration,
              label: `Add ${preStep.experience_name} before (${preStep.duration}min)`,
              reason: preStep.reason || pathwayReason,
              pathway_color: '#3B82F6',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.Description
            });
            beforeCount++;
          }

          // Post-session suggestion (allow up to 2)
          if (experienceIndex < sequence.length - 1 && afterCount < 2) {
            const postStep = sequence[experienceIndex + 1];
            const pathwayReason = generatePathwayReason(pathway.display_name, 'after', postStep.experience_name);
            suggestions.push({
              kind: "experience_add",
              timing: "after",
              experience_id: postStep.experience_id,
              experience_name: postStep.experience_name,
              duration: postStep.duration,
              label: `Add ${postStep.experience_name} after (${postStep.duration}min)`,
              reason: postStep.reason || pathwayReason,
              pathway_color: '#10B981',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.Description
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
              suggestions.push({
                kind: "experience_combo",
                timing: "combo",
                pre_experience_id: beforeSuggestion.experience_id,
                pre_experience_name: beforeSuggestion.experience_name,
                post_experience_id: afterSuggestion.experience_id,
                post_experience_name: afterSuggestion.experience_name,
                label: `Complete ${pathway.display_name}: ${beforeSuggestion.experience_name} + ${afterSuggestion.experience_name}`,
                total_duration: (beforeSuggestion.duration as number) + sequence[experienceIndex].duration + (afterSuggestion.duration as number),
                pathway_color: '#F59E0B',
                pathway_name: pathway.display_name,
                pathway_id: pathway.id,
                pathway_description: pathway.Description
              });
              comboCount++;
            }
          }
        }
      }

      // AI enrichment if requested
      if (ai_enrich && suggestions.length > 0) {
        const enrichedSuggestions = await enrichSuggestionsWithAI(suggestions.map((s: Record<string, unknown>) => ({
          ...s,
          pathway_id: s.pathway_id as string,
          pathway_name: s.pathway_name as string,
          pathway_description: s.pathway_description as string
        })), selectedExperienceName);
        console.log('AI enrichment completed for', enrichedSuggestions.length, 'suggestions');
        
        return NextResponse.json({
          type: "experience_suggestions",
          suggestions: enrichedSuggestions.slice(0, 5) // Max 5 suggestions
        });
      }

      console.log('Returning suggestions:', suggestions.length);
      return NextResponse.json({
        type: "experience_suggestions",
        suggestions: suggestions.slice(0, 3) // Return max 3 suggestions
      });
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

    if (!existingBookings || existingBookings.length === 0) {
      // If no bookings, show pathway options
      const { data: pathways } = await supabase
        .from('experience_pathways')
        .select('*')
        .order('duration_minutes');

      return NextResponse.json({
        title: "Choose Your Journey",
        type: "pathway_selection",
          choices: pathways?.map(pathway => ({
            kind: "pathway",
            id: pathway.id,
            label: `${pathway.display_name} (${pathway.duration_minutes} mins)`,
            pathway_name: pathway.name,
            duration: pathway.duration_minutes,
            sequence: pathway.sequence
          })) || []
      });
    }

    // If bookings exist, show drink recommendations based on pathway
    const pathwayId = existingBookings[0]?.pathway_id;
    
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
          existingBookings.forEach((booking, index) => {
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
              if (index === existingBookings.length - 1) {
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
            bookings: existingBookings.length,
            choices: recommendations
          });
        }
      }

      // Fallback - show individual experience drinks
      const bookingPromises = existingBookings.map(async (booking) => {
        return {
          kind: "booking",
          id: booking.id,
          label: `Add drinks to ${booking.experience_name} (${new Date(booking.slot_time).toLocaleTimeString()})`,
          experience: booking.experience_name,
          time: booking.slot_time
        }
      });
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

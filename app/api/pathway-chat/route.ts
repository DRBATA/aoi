import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// AI enrichment function using pathway descriptions
async function enrichSuggestionsWithAI(suggestions: any[], selectedExperienceName: string) {
  if (suggestions.length === 0) return suggestions;
  
  // Group suggestions by pathway for context separation
  const pathwayGroups: { [key: string]: any } = {};
  
  suggestions.forEach(suggestion => {
    const pathwayId = suggestion.pathway_id;
    if (!pathwayGroups[pathwayId]) {
      pathwayGroups[pathwayId] = {
        pathway_name: suggestion.pathway_name,
        pathway_description: suggestion.pathway_description,
        chips: []
      };
    }
    pathwayGroups[pathwayId].chips.push({
      chip_id: `${suggestion.timing}-${suggestion.experience_id}`,
      timing: suggestion.timing,
      experience_name: suggestion.experience_name,
      current_reason: suggestion.reason
    });
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
      const enriched = aiResult.enriched_reasons?.find((r: any) => r.chip_id === chipId);
      if (enriched && enriched.reason) {
        suggestion.reason = enriched.reason;
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

export async function POST(request: NextRequest) {
  try {
    const { customer_email, selected_date, selected_experience_id, selected_time, ai_enrich = false } = await request.json();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // If an experience is selected, return suggestion chips
    if (selected_experience_id && selected_time) {
      console.log('Fetching suggestions for experience:', selected_experience_id, 'at time:', selected_time);
      
      const { data: pathways } = await supabase
        .from('experience_pathways')
        .select('id, display_name, name, description, sequence, color, duration_minutes');

      console.log('Found pathways:', pathways?.length);
      const suggestions: any[] = [];
      let beforeCount = 0;
      let afterCount = 0;
      let comboCount = 0;
      
      // Get selected experience name for AI
      let selectedExperienceName = '';
      
      // Find pathways containing this experience (allow multiple suggestions)
      for (const pathway of pathways || []) {
        const sequence = pathway.sequence;
        console.log('Checking pathway:', pathway.display_name, 'sequence:', sequence);
        const experienceIndex = sequence.findIndex((step: any) => step.experience_id === selected_experience_id);
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
              pathway_color: pathway.color || '#3B82F6',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.description
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
              pathway_color: pathway.color || '#10B981',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.description
            });
            afterCount++;
          }

          // Combo suggestion (complete pathway) - only 1
          if (experienceIndex > 0 && experienceIndex < sequence.length - 1 && comboCount === 0) {
            const preStep = sequence[experienceIndex - 1];
            const postStep = sequence[experienceIndex + 1];
            suggestions.push({
              kind: "experience_combo",
              timing: "combo",
              pre_experience_id: preStep.experience_id,
              pre_experience_name: preStep.experience_name,
              post_experience_id: postStep.experience_id,
              post_experience_name: postStep.experience_name,
              label: `Complete ${pathway.display_name}: ${preStep.experience_name} + ${postStep.experience_name}`,
              total_duration: preStep.duration + sequence[experienceIndex].duration + postStep.duration,
              pathway_color: pathway.color || '#F59E0B',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.description
            });
            comboCount++;
          }
        }
      }

      // AI enrichment if requested
      if (ai_enrich && suggestions.length > 0) {
        const enrichedSuggestions = await enrichSuggestionsWithAI(suggestions, selectedExperienceName);
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
    const today = selected_date || new Date().toISOString().split('T')[0];
    
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
    const bookingIds = existingBookings.map(b => b.id);
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
              sequenceStep.pre_drinks?.forEach((drink: any) => {
                recommendations.push({
                  kind: "drink",
                  id: drink.product_id,
                  label: `${drink.name} (before ${booking.experience_name})`,
                  booking_id: booking.id,
                  timing: "pre",
                  reason: drink.reason || `Optimal before ${booking.experience_name}`
                });
              });

              // During drinks
              sequenceStep.during_drinks?.forEach((drink: any) => {
                recommendations.push({
                  kind: "drink",
                  id: drink.product_id,
                  label: `${drink.name} (during ${booking.experience_name})`,
                  booking_id: booking.id,
                  timing: "during",
                  reason: `Perfect companion for ${booking.experience_name}`
                });
              });

              // After drinks (only for last booking)
              if (index === existingBookings.length - 1) {
                sequenceStep.after_drinks?.forEach((drink: any) => {
                  recommendations.push({
                    kind: "drink",
                    id: drink.product_id,
                    label: `${drink.name} (after session)`,
                    booking_id: booking.id,
                    timing: "after",
                    reason: "Perfect recovery drink"
                  });
                });

                // Add takeaway drinks
                pathway.takeaway?.forEach((drink: any) => {
                  recommendations.push({
                    kind: "takeaway",
                    id: drink.product_id,
                    label: `${drink.name} x${drink.quantity} (take home)`,
                    booking_id: booking.id,
                    timing: "takeaway",
                    quantity: drink.quantity,
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
      return NextResponse.json({
        title: "Add drinks to your bookings",
        type: "individual_drinks",
        choices: existingBookings.map(booking => ({
          kind: "booking",
          id: booking.id,
          label: `Add drinks to ${booking.experience_name} (${new Date(booking.slot_time).toLocaleTimeString()})`,
          experience: booking.experience_name,
          time: booking.slot_time
        }))
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

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
        content: `You are creating clickable pathway chips for Art Of Implosion venue (seeking wellness inside the self through experiential rather than cognitive means).
Each chip represents a multi-experience combination that adds to the user's already-selected main experience.
When clicked, each chip adds ALL its experiences to booking state with position codes: -1 (before main), +1 (after main), +2 (second after), etc.
CHIP SUMMARY (80 chars max): Explains why this specific sequence creates circumstances for transcendence/improved wellbeing.
INDIVIDUAL EXPLANATIONS: Each experience booking gets its own explanation describing that specific experience at that position + drink rationale.
DRINKS: Extract from pathway data using product_ids (not names) and assign to pre_drinks/during_drinks/after_drinks fields for each experience.
Use ONLY base experience types from the pathway sequences provided.
Base experience types are: AOI Earth Bed, AOI Air Implosion Dome, AOI Air Implosion Dome PRO, AOI Float, Ice Bath, Infrared Sauna, Johny Dar Private Session.
Same base type can appear in different combinations creating different benefits.
Generate 3-4 diverse pathway options: pre-experience preparation, single follow-ups, 2-3 experience combinations, unique sequences.
Each option explains the synergy/sequence benefit of all experiences together in the summary.
Individual explanations include WHY that experience at that position matters + how the drinks support the journey.
Never duplicate the exact same sequence from different pathways, but allow creative recombinations.
Output enriched_chips array with chip_id, summary (for chip display), and experiences array with position-based explanations + drinks.
Remember: User selects specific duration via dropdown after seeing the base experience type, so focus on experience type and sequence logic.
All suggestions must use base experience types from the pathways table data provided.`
      }, {
        role: "user",
        content: `Selected Experience: ${selectedExperienceName}

Pathway Groups: ${JSON.stringify(pathwayGroups, null, 2)}

Generate 3-4 diverse pathway combinations from the data provided.

EXACT EXAMPLES:

Example 1 - User selects "AOI Earth Bed" and you suggest Integration Mini:
{
  "chip_id": "integration_mini_pathway",
  "summary": "Downshift stress fast, then warm to repair for calm clarity",
  "experiences": [
    {
      "position": "+1",
      "experience_type": "Infrared Sauna",
      "available_experiences": [
        {"experience_id": "a9270a4c-dc0b-4e72-bbad-1f01b7cef82e", "experience_name": "Infrared Sauna", "duration_minutes": 30}
      ],
      "explanation": "Following Earth Bed's parasympathetic activation, gentle heat raises core temperature and induces heat-shock proteins (HSPs) - your body's repair crew. Circulation increases, tissues soften, leaving you less stiff and clearer. Humantra Electrolytes replace sodium lost in sweat while spring water maintains hydration during heat exposure.",
      "pre_drinks": [],
      "during_drinks": [
        {"product_id": "44d55f80-5174-4938-90b8-02d46987e1f3", "quantity": 1},
        {"product_id": "87081f28-9b07-4a3c-a64f-086a711a9f32", "quantity": 1}
      ],
      "after_drinks": []
    }
  ]
}

Example 2 - User selects "Infrared Sauna" and you suggest Activate Maxi sequence:
{
  "chip_id": "activate_maxi_pathway",
  "summary": "Shock → flush → lock → flow activation sequence",
  "experiences": [
    {
      "position": "-1",
      "experience_type": "Ice Bath",
      "available_experiences": [
        {"experience_id": "27e73652-e82f-4e65-9780-09ab73f299d2", "experience_name": "Ice Bath", "duration_minutes": 10}
      ],
      "explanation": "Pre-sauna cold snaps your system into high alert. Brief cold spikes noradrenaline, tightens vessels, and clears mental fog - priming you for heat. Ginger Shot warms the core and kicks circulation before cold exposure.",
      "pre_drinks": [{"product_id": "e3567b15-1906-49b6-b912-dbce0fae0e8d", "quantity": 1}],
      "during_drinks": [{"product_id": "812b66cd-a911-4fd9-9fb7-980f432c14d9", "quantity": 1}],
      "after_drinks": []
    },
    {
      "position": "+1",
      "experience_type": "Ice Bath",
      "available_experiences": [
        {"experience_id": "27e73652-e82f-4e65-9780-09ab73f299d2", "experience_name": "Ice Bath", "duration_minutes": 10}
      ],
      "explanation": "Post-sauna cold locks the reset. Reconstricts vessels, dampens inflammation, and stabilizes the autonomic swing from heat exposure. Light Humantra electrolyte top-up maintains balance during second cold exposure.",
      "pre_drinks": [],
      "during_drinks": [{"product_id": "44d55f80-5174-4938-90b8-02d46987e1f3", "quantity": 1}],
      "after_drinks": []
    },
    {
      "position": "+2",
      "experience_type": "AOI Air Implosion Dome PRO",
      "available_experiences": [
        {"experience_id": "7acac09d-a790-49d8-908c-5ebddd9a1ce7", "experience_name": "AOI Air Implosion Dome PRO (30-min)", "duration_minutes": 30},
        {"experience_id": "f6507cf0-7757-439e-9d4e-f1f8f84c95b0", "experience_name": "AOI Air Implosion Dome PRO (50-min)", "duration_minutes": 50},
        {"experience_id": "ad77be13-e3f7-4acf-8535-82b6d22dd540", "experience_name": "AOI Air Implosion Dome PRO (20-min)", "duration_minutes": 20}
      ],
      "explanation": "Turn arousal into flow. Immersive light-sound with free movement channels that alertness into coordinated focus and creative drive. METÉ provides clean cognitive lift for enhanced focus during the premium dome experience.",
      "pre_drinks": [{"product_id": "e007abc9-3255-4484-91f2-162b354da398", "quantity": 1}],
      "during_drinks": [],
      "after_drinks": []
    }
  ]
}

Return JSON: {
  "enriched_chips": [
    {
      "chip_id": "unique_pathway_identifier",
      "summary": "80 char max explaining full sequence benefit",
      "experiences": [
        {
          "position": "-1, +1, +2, +3 etc",
          "experience_type": "base experience name without duration",
          "available_experiences": [
            {"experience_id": "actual_id", "experience_name": "Experience Name (duration)", "duration_minutes": 30}
          ],
          "explanation": "why THIS experience at THIS position with drinks",
          "pre_drinks": [],
          "during_drinks": [{"product_id": "actual_id", "quantity": 1}],
          "after_drinks": []
        }
      ]
    }
  ]
}`
      }]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return suggestions;

    const aiResult = JSON.parse(content);
    
    // Transform new AI structure to chip format for UI
    interface AIChip {
      chip_id: string;
      summary: string;
      experiences: Array<{
        position: string;
        experience_type: string;
        available_experiences?: Array<{
          experience_id: string;
          experience_name: string;
          duration_minutes: number;
        }>;
        explanation: string;
        pre_drinks: Array<{ product_id: string; quantity: number }>;
        during_drinks: Array<{ product_id: string; quantity: number }>;
        after_drinks: Array<{ product_id: string; quantity: number }>;
      }>;
      pathway_name?: string;
      pathway_color?: string;
    }
    
    const enrichedChips = aiResult.enriched_chips?.map((chip: AIChip) => ({
      chip_id: chip.chip_id,
      summary: chip.summary,
      reason: chip.summary, // For backward compatibility
      experiences: chip.experiences,
      // Additional metadata from original pathway
      pathway_id: pathwayGroups[Object.keys(pathwayGroups)[0]]?.chips[0]?.pathway_id,
      pathway_name: pathwayGroups[Object.keys(pathwayGroups)[0]]?.chips[0]?.pathway_name,
      pathway_color: pathwayGroups[Object.keys(pathwayGroups)[0]]?.chips[0]?.pathway_color
    })) || [];

    return enrichedChips;
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
      
      // Get the selected experience to find its base type
      const { data: selectedExp } = await supabase
        .from('venue_experiences')
        .select('experience_name')
        .eq('experience_id', selected_experience_id)
        .single();
      
      // Extract base experience type (remove duration info)
      const getBaseExperienceType = (name: string) => {
        if (name.includes('AOI Air Implosion Dome PRO')) return 'AOI Air Implosion Dome PRO';
        if (name.includes('AOI Air Implosion Dome')) return 'AOI Air Implosion Dome';
        if (name.includes('AOI Earth Bed')) return 'AOI Earth Bed';
        if (name.includes('AOI (art of implosion by the johny dar brand) Float')) return 'AOI Float';
        if (name.includes('Johny Dar Private Session')) return 'Johny Dar Private Session';
        return name; // For Ice Bath, Infrared Sauna
      };
      
      const baseExperienceType = getBaseExperienceType(selectedExp?.experience_name || '');
      
      // Fetch pathways that contain the selected experience ID at database level
      const { data: pathways } = await supabase
        .from('experience_pathways')
        .select('id, display_name, name, Description, sequence, duration_minutes, venue_id')
        .contains('sequence', [{ available_experiences: [{ experience_id: selected_experience_id }] }]);
      
      const relevantPathways = pathways || [];

      console.log('Found relevant pathways:', relevantPathways?.length);
      const suggestions: Record<string, unknown>[] = [];
      let beforeCount = 0;
      let afterCount = 0;
      let comboCount = 0;
      
      // Get selected experience name for AI
      let selectedExperienceName = '';
      
      // Find pathways containing this experience (allow multiple suggestions)
      for (const pathway of relevantPathways || []) {
        const sequence = pathway.sequence;
        console.log('Checking pathway:', pathway.display_name, 'sequence:', JSON.stringify(sequence));
        
        interface PathwayStep {
          available_experiences?: Array<{
            experience_id: string;
            experience_name: string;
            duration_minutes: number;
          }>;
        }
        
        interface ExperienceOption {
          experience_id: string;
          experience_name: string;
          duration_minutes: number;
        }
        
        const experienceIndex = sequence.findIndex((step: PathwayStep) => 
          step.available_experiences?.some((exp: ExperienceOption) => exp.experience_id === selected_experience_id)
        );
        console.log('Experience index in', pathway.display_name, ':', experienceIndex);
        
        if (experienceIndex !== -1) {
          console.log('Found experience in pathway:', pathway.display_name);
          
          // Get selected experience base type for AI
          if (!selectedExperienceName) {
            selectedExperienceName = baseExperienceType;
          }
          
          // Pre-session suggestion (allow up to 2)
          if (experienceIndex > 0 && beforeCount < 2) {
            const preStep = sequence[experienceIndex - 1];
            suggestions.push({
              kind: "experience_add",
              timing: "before",
              experience_type: preStep.experience_type,
              available_experiences: preStep.available_experiences,
              pre_drinks: preStep.pre_drinks || [],
              during_drinks: preStep.during_drinks || [],
              after_drinks: preStep.after_drinks || [],
              label: `Add ${preStep.experience_type} before`,
              reason: "", // Will be filled by AI
              pathway_color: '#3B82F6',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.Description,
              chip_id: `-1_${preStep.experience_type.replace(/\s+/g, '_')}`
            });
            beforeCount++;
          }

          // Post-session suggestion (allow up to 2)
          if (experienceIndex < sequence.length - 1 && afterCount < 2) {
            const postStep = sequence[experienceIndex + 1];
            suggestions.push({
              kind: "experience_add",
              timing: "after",
              experience_type: postStep.experience_type,
              available_experiences: postStep.available_experiences,
              pre_drinks: postStep.pre_drinks || [],
              during_drinks: postStep.during_drinks || [],
              after_drinks: postStep.after_drinks || [],
              label: `Add ${postStep.experience_type} after`,
              reason: "", // Will be filled by AI
              pathway_color: '#10B981',
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.Description,
              chip_id: `+${afterCount + 1}_${postStep.experience_type.replace(/\s+/g, '_')}`
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
                chip_id: `combo_-1_+1_${pathway.id}`
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
      
      return NextResponse.json({
        type: 'experience_suggestions',
        suggestions: enrichedSuggestions
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

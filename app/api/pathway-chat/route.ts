import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';

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
    const { selected_experience_id } = await req.json();
    
    if (!selected_experience_id) {
      return NextResponse.json({ error: 'Missing selected_experience_id' }, { status: 400 });
    }

    const supabase = await createClient();

    console.log('Fetching suggestions for experience:', selected_experience_id);
      
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
      if (name.includes('Ice Bath')) return 'Ice Bath';
      return name;
    };
    
    const baseExperienceType = getBaseExperienceType(selectedExp?.experience_name || '');
      
      // Fetch pathways that contain the selected experience ID using raw SQL
      const { data: pathways } = await supabase
        .rpc('search_pathways_by_experience', { exp_id: selected_experience_id });
      
      const relevantPathways = pathways || [];

      console.log('Found relevant pathways:', relevantPathways?.length);
      const suggestions: Record<string, unknown>[] = [];
      
      // Get selected experience name for AI
      let selectedExperienceName = '';
      
      // Generate complete pathway suggestions for AI enrichment
      for (const pathway of relevantPathways || []) {
        const sequence = pathway.sequence;
        console.log('Checking pathway:', pathway.display_name, 'sequence:', JSON.stringify(sequence));
        
        interface PathwayStep {
          experience_type: string;
          available_experiences: Array<{
            experience_id: string;
            experience_name: string;
            duration_minutes: number;
          }>;
          default_experience_id: string;
          pre_drinks?: unknown[];
          during_drinks?: unknown[];
          after_drinks?: unknown[];
        }
        
        const experienceIndex = sequence.findIndex((step: PathwayStep) => 
          step.available_experiences?.some(exp => exp.experience_id === selected_experience_id)
        );
        console.log('Experience index in', pathway.display_name, ':', experienceIndex);
        
        if (experienceIndex !== -1) {
          console.log('Found experience in pathway:', pathway.display_name);
          
          // Get selected experience base type for AI
          if (!selectedExperienceName) {
            selectedExperienceName = baseExperienceType;
          }
          
          // Build the complete pathway with positions relative to selected experience
          const pathwayExperiences = [];
          
          // Add experiences before the selected one
          for (let i = 0; i < experienceIndex; i++) {
            const step = sequence[i];
            const position = i - experienceIndex; // Will be negative (-1, -2, etc)
            
            pathwayExperiences.push({
              position: position.toString(),
              experience_type: step.experience_type,
              available_experiences: step.available_experiences,
              pre_drinks: step.pre_drinks || [],
              during_drinks: step.during_drinks || [],
              after_drinks: step.after_drinks || []
            });
          }
          
          // Add experiences after the selected one
          for (let i = experienceIndex + 1; i < sequence.length; i++) {
            const step = sequence[i];
            const position = i - experienceIndex; // Will be positive (+1, +2, etc)
            
            pathwayExperiences.push({
              position: `+${position}`,
              experience_type: step.experience_type,
              available_experiences: step.available_experiences,
              pre_drinks: step.pre_drinks || [],
              during_drinks: step.during_drinks || [],
              after_drinks: step.after_drinks || []
            });
          }
          
          // Only add if there are additional experiences in this pathway
          if (pathwayExperiences.length > 0) {
            suggestions.push({
              kind: "pathway_combination",
              pathway_name: pathway.display_name,
              pathway_id: pathway.id,
              pathway_description: pathway.Description,
              chip_id: `${pathway.name}_pathway`,
              experiences: pathwayExperiences
            });
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

  } catch (error) {
    console.error('Pathway chat error:', error);
    return NextResponse.json({ 
      error: "Failed to get recommendations" 
    }, { status: 500 });
  }
}

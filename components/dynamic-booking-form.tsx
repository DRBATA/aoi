'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Package, Plus, Sparkles } from 'lucide-react';
import { useAgentRPC } from '@/app/hooks/useAgentRPC';

interface CustomItem {
  name: string;
  price: number;
  quantity: number;
}

export function DynamicBookingForm() {
  const { bookExperienceWithAI, addToCartWithAI } = useAgentRPC();
  const [selectedExperience, setSelectedExperience] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [customItem, setCustomItem] = useState<CustomItem>({ name: '', price: 0, quantity: 1 });
  const [loading, setLoading] = useState(false);

  // AOI Experiences
  const experiences = [
    { id: 'aoi-sauna', name: 'Infrared Sauna', duration: 30, price: 150 },
    { id: 'aoi-cold-plunge', name: 'Cold Plunge', duration: 20, price: 100 },
    { id: 'aoi-float', name: 'Float Tank', duration: 60, price: 250 },
    { id: 'aoi-compression', name: 'Compression Therapy', duration: 30, price: 120 },
    { id: 'aoi-red-light', name: 'Red Light Therapy', duration: 20, price: 80 }
  ];

  const handleBookExperience = async () => {
    if (!selectedExperience || !preferredTime) return;
    
    setLoading(true);
    const experience = experiences.find(e => e.id === selectedExperience);
    
    try {
      const result = await bookExperienceWithAI({
        experience_id: selectedExperience,
        preferred_time: preferredTime, // Natural language like "around 2pm"
        duration_minutes: experience?.duration || 30
      });

      if (result.success) {
        // Reset form
        setSelectedExperience('');
        setPreferredTime('');
        
        // Show success (cart modal will update via realtime)
        console.log('Booking added with AI recommendation:', result.recommendation);
      }
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomItem = async () => {
    if (!customItem.name || customItem.price <= 0) return;
    
    setLoading(true);
    try {
      // Add custom item to cart
      const result = await addToCartWithAI({
        type: 'product',
        product_details: {
          name: customItem.name,
          price: customItem.price * 100, // Convert to cents
          quantity: customItem.quantity
        }
      });

      if (result.success) {
        // Reset form
        setCustomItem({ name: '', price: 0, quantity: 1 });
        console.log('Custom item added');
      }
    } catch (error) {
      console.error('Failed to add custom item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200">
      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50">
          <TabsTrigger value="booking" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Book Experience
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            Add Custom Item
          </TabsTrigger>
        </TabsList>

        <TabsContent value="booking" className="space-y-4 mt-4">
          <div>
            <Label className="text-purple-700">Select Experience</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {experiences.map((exp) => (
                <Button
                  key={exp.id}
                  variant={selectedExperience === exp.id ? "default" : "outline"}
                  onClick={() => setSelectedExperience(exp.id)}
                  className={selectedExperience === exp.id 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
                    : "hover:bg-purple-50"}
                >
                  <div className="text-left">
                    <div className="font-medium">{exp.name}</div>
                    <div className="text-xs opacity-80">
                      {exp.duration}min • AED {exp.price}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="time" className="text-purple-700">Preferred Time</Label>
            <Input
              id="time"
              placeholder="e.g., 'around 2pm' or 'morning'"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="mt-2 border-purple-200 focus:border-purple-400"
            />
            <p className="text-xs text-gray-600 mt-1">
              <Sparkles className="inline h-3 w-3 mr-1" />
              AI will find the best available slot and suggest hydration pairings
            </p>
          </div>

          <Button
            onClick={handleBookExperience}
            disabled={!selectedExperience || !preferredTime || loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? "Booking..." : "Book with AI Recommendations"}
          </Button>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="item-name" className="text-purple-700">Item Name</Label>
            <Input
              id="item-name"
              placeholder="e.g., Massage Oil, Towel Service"
              value={customItem.name}
              onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
              className="mt-2 border-purple-200 focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-purple-700">Price (AED)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={customItem.price || ''}
                onChange={(e) => setCustomItem({ ...customItem, price: parseFloat(e.target.value) || 0 })}
                className="mt-2 border-purple-200 focus:border-purple-400"
              />
            </div>

            <div>
              <Label htmlFor="quantity" className="text-purple-700">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={customItem.quantity}
                onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value) || 1 })}
                className="mt-2 border-purple-200 focus:border-purple-400"
              />
            </div>
          </div>

          <Button
            onClick={handleAddCustomItem}
            disabled={!customItem.name || customItem.price <= 0 || loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add Custom Item to Cart"}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

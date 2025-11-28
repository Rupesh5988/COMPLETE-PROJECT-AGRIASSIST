"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

// UI Components (Make sure these exist in your project!)
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Loader2, Wand2, BarChart3 } from "lucide-react";

// Updated Schema
const formSchema = z.object({
  district: z.string().min(1, "District is required"),
  N: z.coerce.number(),
  P: z.coerce.number(),
  K: z.coerce.number(),
  pH: z.coerce.number(),
  rainfall: z.coerce.number(),
  temperature: z.coerce.number(),
  soil_color: z.string().min(1, "Soil Color is required"),
});

// IMPORTANT: Check that your Python backend is running on this port!
const API_URL = "http://127.0.0.1:5001";

export function CropRecommendation() {
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState([]); // Stores Top 5
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({ districts: [], soils: [] });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { district: "", N: 0, P: 0, K: 0, pH: 0, rainfall: 0, temperature: 0, soil_color: "" },
  });

  const selectedDistrict = form.watch("district");

  // 1. Fetch Options on Load
  useEffect(() => {
    axios.get(`${API_URL}/get_form_options`)
      .then(res => setOptions(res.data))
      .catch(err => console.error("API Error - Is Backend Running?", err));
  }, []);

  // 2. Auto-fill Data (Smart Knowledge Base)
  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const res = await axios.post(`${API_URL}/get_environmental_data`, { district: selectedDistrict });
        const d = res.data;
        // Update all form fields
        form.setValue("N", d.N); 
        form.setValue("P", d.P); 
        form.setValue("K", d.K);
        form.setValue("pH", d.pH); 
        form.setValue("temperature", d.temperature); 
        form.setValue("rainfall", d.rainfall);
        form.setValue("soil_color", d.soil_color);
      } catch (e) { console.error(e); }
      finally { setIsFetching(false); }
    };
    fetchData();
  }, [selectedDistrict, form.setValue]);

  // 3. Submit for Prediction
  function onSubmit(values) {
    startTransition(async () => {
      setError(null); setResults([]);
      try {
        const res = await axios.post(`${API_URL}/predict`, values);
        if (res.data.recommendations) {
            setResults(res.data.recommendations);
        } else {
            setError("No recommendations found.");
        }
      } catch (e) { 
          setError("Prediction failed. Check backend console."); 
      }
    });
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-emerald-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Sprout className="w-6 h-6 text-emerald-600" /> Smart Crop Recommendation
            </CardTitle>
            <CardDescription>Select a district to auto-load soil data and get Top 5 suitable crops.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* District Selector */}
               <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {options.districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
               )} />
               
               {/* Soil Selector */}
               <FormField control={form.control} name="soil_color" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Soil" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {options.soils.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
               )} />
            </div>

            {isFetching && (
               <div className="text-center text-emerald-600 text-sm animate-pulse flex justify-center gap-2 items-center bg-emerald-50 p-2 rounded">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading environmental profile...
               </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <FormField control={form.control} name="temperature" render={({ field }) => ( <FormItem><FormLabel>Temp (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="rainfall" render={({ field }) => ( <FormItem><FormLabel>Rainfall (mm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="pH" render={({ field }) => ( <FormItem><FormLabel>pH Level</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="N" render={({ field }) => ( <FormItem><FormLabel>Nitrogen (N)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="P" render={({ field }) => ( <FormItem><FormLabel>Phosphorus (P)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="K" render={({ field }) => ( <FormItem><FormLabel>Potassium (K)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-6 pb-8">
            <Button type="submit" disabled={isPending || isFetching} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
               {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Analyze Suitability
            </Button>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* --- RESULTS SECTION --- */}
            {results.length > 0 && (
               <div className="w-full space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-emerald-900">
                     <BarChart3 className="w-5 h-5" /> Top Crop Recommendations
                  </h3>
                  <div className="space-y-3">
                     {results.map((item, index) => (
                        <div key={index} className="space-y-1">
                           <div className="flex justify-between text-sm font-medium">
                              {/* Top result is bold and dark green */}
                              <span className={index===0 ? "text-emerald-700 font-bold" : "text-gray-700"}>
                                {index+1}. {item.crop}
                              </span>
                              <span className="text-gray-500">{item.probability}% Match</span>
                           </div>
                           
                           {/* Progress Bar Container */}
                           <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              {/* Progress Bar Fill - Animated */}
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                    index === 0 ? "bg-emerald-600" : "bg-emerald-300"
                                }`} 
                                style={{ width: `${item.probability}%` }} 
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
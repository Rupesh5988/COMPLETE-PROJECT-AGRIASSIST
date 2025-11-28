"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, Wand2, BarChart3 } from "lucide-react";

// --- CONFIGURATION ---
const API_BASE_URL = "http://127.0.0.1:5002";

// Form Validation Schema
const formSchema = z.object({
  cropType: z.string().min(1, "Crop type is required."),
  district: z.string().min(1, "District is required."),
  nitrogen: z.coerce.number(),
  phosphorus: z.coerce.number(),
  potassium: z.coerce.number(),
  ph: z.coerce.number(),
  rainfall: z.coerce.number(),
  temperature: z.coerce.number(),
  soil_color: z.string(), // Auto-filled by backend
});

export function FertilizerAdvisory() {
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState([]); // Stores the Top 5 recommendations
  const [error, setError] = useState(null);
  const [formOptions, setFormOptions] = useState({ districts: [], crops: [] });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { 
        cropType: "", district: "", 
        nitrogen: 0, phosphorus: 0, potassium: 0, 
        ph: 0, rainfall: 0, temperature: 0, 
        soil_color: "" 
    },
  });

  const selectedDistrict = form.watch("district");

  // 1. Fetch Dropdown Options on Mount (Districts & Crops)
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get_form_options`);
        setFormOptions(response.data);
      } catch (err) {
        console.error("Backend Error:", err);
        setError("Failed to load options. Is the Flask server running?");
      }
    };
    fetchFormOptions();
  }, [form.setValue]);

  // 2. Auto-fill Environment Data when District Changes
  // This uses the new "Streamlined" Backend Logic (No lat/lon needed on frontend)
  useEffect(() => {
    if (!selectedDistrict) return;

    const fetchAndSetData = async () => {
      setIsFetching(true);
      setError(null);
      setResults([]); // Clear previous results when inputs change
      
      try {
        // We just send the District Name. The Backend does the smart lookup.
        const response = await axios.post(`${API_BASE_URL}/get_environmental_data`, { 
            district: selectedDistrict 
        });
        const data = response.data;

        // Update form fields
        form.setValue("nitrogen", data.N);
        form.setValue("phosphorus", data.P);
        form.setValue("potassium", data.K);
        form.setValue("ph", data.pH);
        form.setValue("temperature", data.temperature);
        form.setValue("rainfall", data.rainfall);
        form.setValue("soil_color", data.soil_color); 
        
      } catch (e) {
        console.error("Env Data Error:", e);
        // We don't block the user; they can still type manually if this fails.
      } finally {
        setIsFetching(false);
      }
    };

    fetchAndSetData();
  }, [selectedDistrict, form.setValue]);

  // 3. Handle Prediction Submission
  function onSubmit(values) {
    startTransition(async () => {
      setError(null);
      setResults([]);
      try {
        // Map 'cropType' to 'crop' for the backend
        const finalPayload = { ...values, crop: values.cropType };
        
        const response = await axios.post(`${API_BASE_URL}/predict`, finalPayload);
        
        if (response.data.recommendations) {
            setResults(response.data.recommendations);
        } else {
            setError("No valid recommendations received from the model.");
        }
      } catch (e) {
        console.error("Prediction Error:", e);
        setError("Failed to get prediction. Please check the form data.");
      }
    });
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-green-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <FlaskConical className="w-6 h-6 text-green-600" />
              Fertilizer Advisory System
            </CardTitle>
            <CardDescription>
              Select a district to auto-fill local data, then get Top 5 AI recommendations.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            
            {/* --- SELECTION ROW --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control} name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {formOptions.districts.map((d) => ( <SelectItem key={d} value={d}>{d}</SelectItem> ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Crop" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {formOptions.crops.map((c) => ( <SelectItem key={c} value={c}>{c}</SelectItem> ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* --- AUTO-FILL INDICATOR --- */}
            {isFetching && (
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching smart environmental data for {selectedDistrict}...</span>
                </div>
            )}

            {/* --- ENVIRONMENTAL DATA ROW --- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <FormField control={form.control} name="temperature" render={({ field }) => ( <FormItem><FormLabel>Temp (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="rainfall" render={({ field }) => ( <FormItem><FormLabel>Rainfall (mm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="ph" render={({ field }) => ( <FormItem><FormLabel>pH Level</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem> )}/>
               {/* Read Only Soil Color */}
               <FormField control={form.control} name="soil_color" render={({ field }) => ( <FormItem><FormLabel>Soil Type</FormLabel><FormControl><Input {...field} readOnly className="bg-gray-100 text-gray-600" /></FormControl></FormItem> )}/>
            </div>

            {/* --- NUTRIENTS ROW --- */}
            <div className="grid grid-cols-3 gap-4">
               <FormField control={form.control} name="nitrogen" render={({ field }) => ( <FormItem><FormLabel>Nitrogen (N)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="phosphorus" render={({ field }) => ( <FormItem><FormLabel>Phosphorus (P)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
               <FormField control={form.control} name="potassium" render={({ field }) => ( <FormItem><FormLabel>Potassium (K)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )}/>
            </div>

          </CardContent>

          <CardFooter className="flex-col gap-6 pb-8">
            <Button type="submit" disabled={isPending || isFetching} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold">
              {(isPending || isFetching) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Analyze & Recommend
            </Button>
            
            {error && <p className="text-sm text-red-500 font-medium text-center bg-red-50 p-2 rounded w-full">{error}</p>}

            {/* --- RESULTS DISPLAY: TOP 5 WITH PROGRESS BARS --- */}
            {results.length > 0 && (
              <div className="w-full space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-green-900">
                    <BarChart3 className="w-5 h-5 text-green-700" /> Top Recommendations
                </h3>
                <div className="space-y-4">
                    {results.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span className={index === 0 ? "text-green-800 font-bold text-base" : "text-gray-700"}>
                                    {index + 1}. {item.fertilizer}
                                </span>
                                <span className="text-gray-500">{item.probability}% Suitability</span>
                            </div>
                            
                            {/* Progress Bar Container */}
                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                {/* Progress Bar Fill */}
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        index === 0 ? "bg-green-600" : 
                                        index === 1 ? "bg-green-500" : 
                                        index === 2 ? "bg-green-400" :
                                        "bg-green-300"
                                    }`}
                                    style={{ width: `${item.probability}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-center text-gray-500 mt-4">
                    *Suitability percentage is based on soil type, NPK levels, and crop requirements.
                </p>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
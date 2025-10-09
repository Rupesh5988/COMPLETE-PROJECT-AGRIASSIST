"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getEnvironmentalData, fertilizerRecommendation } from "@/ai/flows/fertilizer-recommendation";
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, Sparkles, Wand2 } from "lucide-react";

// This map is now updated with the 7 districts from your image.
const districtCoordinates = {
    "Kolhapur": { "lat": 16.7050, "lon": 74.2433 },
    "Pune": { "lat": 18.5204, "lon": 73.8567 },
    "Sangli": { "lat": 16.8524, "lon": 74.5815 },
    "Satara": { "lat": 17.6800, "lon": 73.9900 },
    "Solapur": { "lat": 17.6599, "lon": 75.9004 }
}

const formSchema = z.object({
  cropType: z.string().min(1, "Crop type is required."),
  district: z.string().min(1, "District is required."),
  nitrogen: z.coerce.number(),
  phosphorus: z.coerce.number(),
  potassium: z.coerce.number(),
  ph: z.coerce.number(),
  rainfall: z.coerce.number(),
  temperature: z.coerce.number(),
  soil_color: z.string(),
});

export function FertilizerAdvisory() {
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formOptions, setFormOptions] = useState({ districts: [], crops: [] });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { cropType: "", district: "", nitrogen: 0, phosphorus: 0, potassium: 0, ph: 0, rainfall: 0, temperature: 0, soil_color: "" },
  });

  const selectedDistrict = form.watch("district");

  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5002/get_form_options");
        setFormOptions(response.data);
        if (response.data.districts.length > 0) {
          form.setValue("district", response.data.districts[0]);
        }
        if (response.data.crops.length > 0) {
          form.setValue("cropType", response.data.crops[0]);
        }
      } catch (err) {
        setError("Failed to load form options from server. Please ensure the backend is running.");
      }
    };
    fetchFormOptions();
  }, [form.setValue]);

  useEffect(() => {
    if (!selectedDistrict || !districtCoordinates[selectedDistrict]) return;

    const fetchAndSetData = async () => {
      setIsFetching(true);
      setError(null);
      setResult(null);
      const { lat, lon } = districtCoordinates[selectedDistrict];
      try {
        const data = await getEnvironmentalData(lat, lon);
        form.setValue("nitrogen", data.N);
        form.setValue("phosphorus", data.P);
        form.setValue("potassium", data.K);
        form.setValue("ph", data.pH);
        form.setValue("temperature", data.temperature);
        form.setValue("rainfall", data.rainfall);
        form.setValue("soil_color", data.soil_color);
      } catch (e) {
        setError("Could not fetch environmental data for the selected district.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchAndSetData();
  }, [selectedDistrict, form.setValue]);

  function onSubmit(values) {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const finalPayload = { ...values, crop: values.cropType };
        const recommendation = await getFertilizerPrediction(finalPayload);
        setResult(recommendation);
      } catch (e) {
        setError("Failed to get prediction. Please check the form data.");
      }
    });
  }

  return (
    <Card>
      <Form {...form}>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-primary" />
              Fertilizer Advisory
            </CardTitle>
            <CardDescription>Select a district to auto-fill local data, then get AI recommendations.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control} name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a district" /></SelectTrigger></FormControl>
                      <SelectContent>{formOptions.districts.map((d) => ( <SelectItem key={d} value={d}>{d}</SelectItem> ))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl>
                      <SelectContent>{formOptions.crops.map((crop) => ( <SelectItem key={crop} value={crop}>{crop}</SelectItem> ))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {isFetching && <p className="text-sm text-center animate-pulse text-gray-600">Fetching local environmental data...</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="temperature" render={({ field }) => ( <FormItem><FormLabel>Temperature (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="rainfall" render={({ field }) => ( <FormItem><FormLabel>Rainfall (mm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="ph" render={({ field }) => ( <FormItem><FormLabel>pH Level</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="nitrogen" render={({ field }) => ( <FormItem><FormLabel>Nitrogen (N)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="phosphorus" render={({ field }) => ( <FormItem><FormLabel>Phosphorus (P)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="potassium" render={({ field }) => ( <FormItem><FormLabel>Potassium (K)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </div>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" disabled={isPending || isFetching}>
              {(isPending || isFetching) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Get Recommendation
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {result && (
              <div className="space-y-2 rounded-lg border bg-secondary/50 p-4">
                <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Recommendation</h3>
                <p className="text-sm text-muted-foreground">{result.recommendations}</p>
              </div>
            )}
          </CardFooter>
          
        </form>
      </Form>
    </Card>
  );
}
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, Sparkles, Wand2, LocateFixed } from "lucide-react";

// Schema for form validation
const formSchema = z.object({
  Nitrogen: z.coerce.number().min(0, "Value must be positive"),
  Phosphorus: z.coerce.number().min(0, "Value must be positive"),
  Potassium: z.coerce.number().min(0, "Value must be positive"),
  pH: z.coerce.number().min(0, "pH must be between 0 and 14").max(14),
  Rainfall: z.coerce.number().min(0, "Value must be positive"),
  Temperature: z.coerce.number(),
  Soil_color: z.string().min(1, "Soil color is required"),
});

// The URL of your running Flask API
const API_URL = "http://127.0.0.1:5001";

export function CropPrediction() {
  const [isPending, startTransition] = useTransition();
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Nitrogen: 85,
      Phosphorus: 50,
      Potassium: 100,
      pH: 7.0,
      Rainfall: 1000,
      Temperature: 25,
      Soil_color: "Black",
    },
  });

  // Function to handle fetching data based on GPS
  const handleGetLocationDefaults = () => {
    setIsFetchingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`${API_URL}/get_all_defaults`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lon: longitude }),
          });
          if (!response.ok) throw new Error("Failed to fetch location data.");

          const data = await response.json();

          // Using form.setValue to update form fields reactively
          form.setValue('Nitrogen', data.N);
          form.setValue('Phosphorus', data.P);
          form.setValue('Potassium', data.K);
          form.setValue('pH', data.pH);
          form.setValue('Rainfall', Math.round(data.rainfall));
          form.setValue('Temperature', data.temperature);
          form.setValue('Soil_color', data.soil_type);

        } catch (e) {
          setError("Could not fetch location-based data. Please enter manually.");
          console.error(e);
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable it in your browser or enter data manually.");
        setIsFetchingLocation(false);
      }
    );
  };

  // Function to handle the final prediction submission
  function onSubmit(values) {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const formData = new FormData();
        for (const key in values) {
          formData.append(key, values[key]);
        }

        const response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          body: formData, // Sending as form data
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.error || "Prediction failed.");
        }
        setResult(responseData);

      } catch (e) {
        setError(e.message || "Failed to get prediction. Please try again.");
        console.error(e);
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
              Crop Recommendation System
            </CardTitle>
            <CardDescription>Enter soil and weather conditions to get a crop recommendation.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
             <Button type="button" variant="outline" onClick={handleGetLocationDefaults} disabled={isFetchingLocation} className="w-full">
                {isFetchingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                Get Values From My Location
            </Button>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="Nitrogen" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nitrogen (N)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 85" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="Phosphorus" control={form.control} render={({ field }) => (
                     <FormItem>
                        <FormLabel>Phosphorus (P)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="Potassium" control={form.control} render={({ field }) => (
                     <FormItem>
                        <FormLabel>Potassium (K)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="pH" control={form.control} render={({ field }) => (
                     <FormItem>
                        <FormLabel>Soil pH</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g., 7.0" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="Rainfall" control={form.control} render={({ field }) => (
                     <FormItem>
                        <FormLabel>Annual Rainfall (mm)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="Temperature" control={form.control} render={({ field }) => (
                     <FormItem>
                        <FormLabel>Temperature (°C)</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g., 25" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="Soil_color" control={form.control} render={({ field }) => (
                     <FormItem>
                        <FormLabel>Soil Color</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a soil color" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Black">Black</SelectItem>
                                <SelectItem value="Red">Red</SelectItem>
                                <SelectItem value="Dark Brown">Dark Brown</SelectItem>
                                <SelectItem value="Light Brown">Light Brown</SelectItem>
                                <SelectItem value="Medium Brown">Medium Brown</SelectItem>
                                <SelectItem value="Reddish Brown">Reddish Brown</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Get Suggestion
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {result && (
              <div className="space-y-2 rounded-lg border bg-secondary/50 p-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Recommended Crop
                </h3>
                <p className="text-lg text-center font-bold text-primary">{result.prediction_text}</p>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
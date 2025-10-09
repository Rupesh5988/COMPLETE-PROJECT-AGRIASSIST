"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fertilizerRecommendation } from "@/ai/flows/fertilizer-recommendation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, Sparkles, Wand2 } from "lucide-react";

const formSchema = z.object({
  cropType: z.string().min(2, "Crop type is required."),
  soilData: z.string().min(2, "Soil data is required."),
  region: z.string().min(2, "Region is required."),
});

export function CropPrediction() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "Tomatoes",
      soilData: "pH 6.5, low nitrogen, medium phosphorus",
      region: "Coastal California",
    },
  });

  function onSubmit(values) {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const recommendation = await fertilizerRecommendation(values);
        setResult(recommendation);
      } catch (e) {
        setError("Failed to get recommendation. Please try again.");
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
              Crop Prediction
            </CardTitle>
            <CardDescription>crop Prediction System.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="Nitrogen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nitrogen (N) in soil:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="90" />
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Phosphorus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phosphorus (P) in soil:</FormLabel>
                  <FormControl>
                    <Input placeholder="60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="Potassium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potassium (K) in soil:</FormLabel>
                  <FormControl>
                    <Input placeholder="40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pH_val"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>pH value of soil:</FormLabel>
                  <FormControl>
                    <Input placeholder="7" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Rain_mm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Rainfall (mm):</FormLabel>
                  <FormControl>
                    <Input placeholder="900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="curr_temp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Temperature (°C):</FormLabel>
                  <FormControl>
                    <Input placeholder="32°C" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="soil_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soil Color:</FormLabel>
                  <FormControl>
                    <Input placeholder="Black" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Get Suggesion
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {result && (
              <div className="space-y-2 rounded-lg border bg-secondary/50 p-4">
                <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" />Recommendation</h3>
                <p className="text-sm text-muted-foreground">{result.recommendations}</p>
              </div>
            )}
          </CardFooter>
          
        </form>
      </Form>
    </Card>
  );
}

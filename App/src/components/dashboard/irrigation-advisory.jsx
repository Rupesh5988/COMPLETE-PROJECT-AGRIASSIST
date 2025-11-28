"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// 1. IMPORT THE LANGUAGE HOOK
import { useLanguage } from "@/components/language-provider"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Loader2, Sparkles, Wand2, CloudRain } from "lucide-react";

// Schema remains same (validation messages can be translated too, but keeping simple for now)
const formSchema = z.object({
  cropType: z.string().min(2, "Required"),
  soilType: z.string().min(2, "Required"),
  fieldSize: z.coerce.number().min(0.1, "Required"),
  irrigationMethod: z.string().min(2, "Required"),
});

const API_URL = "http://127.0.0.1:5005/irrigation-plan"; 

export function IrrigationAdvisory() {
  const { t } = useLanguage(); // 2. USE THE HOOK
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { cropType: "", soilType: "Loam", fieldSize: 1, irrigationMethod: "Drip" },
  });

  function onSubmit(values) {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error("Connection failed");
        const data = await response.json();
        setResult(data);
        setSheetOpen(false);
      } catch (e) {
        setError("Error connecting to server.");
      }
    });
  }

  return (
    <Card className="flex flex-col border-emerald-100 shadow-sm">
      <CardHeader className="bg-emerald-50/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Droplets className="w-5 h-5 text-emerald-600" />
          {t("card_irri_title")}
        </CardTitle>
        <CardDescription>{t("card_irri_desc")}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4 pt-6">
        {result ? (
           <div className="space-y-4 rounded-xl border border-emerald-100 bg-white p-4 text-sm shadow-sm animate-in fade-in">
            <h3 className="font-semibold flex items-center gap-2 text-emerald-700">
                <Sparkles className="w-4 h-4 text-amber-500"/>
                {t("res_insight")}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t("res_freq")}</span>
                    <p className="font-medium text-slate-800 mt-1">{result.frequency}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t("res_vol")}</span>
                    <p className="font-medium text-slate-800 mt-1">{result.waterAmount}</p>
                </div>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <p className="text-slate-700 mt-1 leading-relaxed whitespace-pre-line">{result.notes}</p>
            </div>
            
            <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">{t("res_schedule_note")}</p>
            </div>
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="bg-emerald-100 p-3 rounded-full">
                    <Wand2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium text-slate-700">{t("res_empty")}</p>
                    <p className="text-xs text-slate-500 max-w-[200px] mx-auto">{t("res_empty_desc")}</p>
                </div>
            </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-6">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {result ? t("btn_recalc") : t("btn_generate")}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{t("card_irri_title")}</SheetTitle>
              <SheetDescription>{t("card_irri_desc")}</SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="cropType" render={({ field }) => ( 
                            <FormItem>
                                <FormLabel>{t("label_crop")}</FormLabel>
                                <FormControl><Input placeholder={t("ph_crop")} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem> 
                        )} />
                        
                        <FormField control={form.control} name="fieldSize" render={({ field }) => ( 
                            <FormItem>
                                <FormLabel>{t("label_size")}</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem> 
                        )} />
                    </div>

                    <FormField control={form.control} name="soilType" render={({ field }) => ( 
                        <FormItem>
                            <FormLabel>{t("label_soil")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Clay">{t("soil_clay")}</SelectItem>
                                    <SelectItem value="Loam">{t("soil_loam")}</SelectItem>
                                    <SelectItem value="Sandy">{t("soil_sandy")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem> 
                    )} />

                    <FormField control={form.control} name="irrigationMethod" render={({ field }) => ( 
                        <FormItem>
                            <FormLabel>{t("label_method")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Drip">{t("method_drip")}</SelectItem>
                                    <SelectItem value="Sprinkler">{t("method_sprinkler")}</SelectItem>
                                    <SelectItem value="Flood">{t("method_flood")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem> 
                    )} />

                    <Button type="submit" disabled={isPending} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                        {isPending ? (
                            <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("btn_analyzing")} </>
                        ) : ( t("btn_calc") )}
                    </Button>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
}
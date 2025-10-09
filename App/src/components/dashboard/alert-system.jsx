import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Bell, Bug, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: 1,
    icon: AlertTriangle,
    title: "High Wind Warning",
    description: "Gusts up to 45 mph expected tomorrow. Secure loose equipment.",
    severity: "destructive",
    time: "2h ago",
  },
  {
    id: 2,
    icon: Bug,
    title: "Aphid Infestation Detected",
    description: "Aphid populations are rising in your region. Scout your fields.",
    severity: "default",
    time: "1d ago",
  },
  {
    id: 3,
    icon: Wind,
    title: "Frost Advisory",
    description: "Temperatures may drop near freezing tonight. Protect sensitive crops.",
    severity: "secondary",
    time: "3d ago",
  },
];

export function AlertSystem() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-10 h-6 text-primary" />
          Alert System
        </CardTitle>
        <CardDescription>
          Critical notifications and updates for your farm.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className="flex items-start gap-4">
              <div className="mt-1">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{alert.title}</p>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
              <Badge variant={alert.severity} className="capitalize hidden sm:block">{alert.severity === 'destructive' ? 'Urgent' : 'Info'}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

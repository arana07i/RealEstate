'use client';

import { Sun, Cloud, CloudRain, Wind, Thermometer, Droplet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface WeatherWidgetProps {
  location?: string;
}

const getWeatherIcon = (condition: string) => {
  if (condition.includes('rain')) return CloudRain;
  if (condition.includes('cloud')) return Cloud;
  return Sun;
};

const SAMPLE_WEATHER = {
  temperature: 18,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  icon: 'partly_cloudy',
};

export function WeatherWidget({ location }: WeatherWidgetProps) {
  const Icon = getWeatherIcon(SAMPLE_WEATHER.condition);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-primary">Weather</h2>
      <p className="mt-2 text-sm text-muted-foreground">{location || 'Property Location'}</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icon size={48} className="text-accent" />
              <div>
                <p className="text-4xl font-bold text-primary">{SAMPLE_WEATHER.temperature}°C</p>
                <p className="text-muted-foreground">{SAMPLE_WEATHER.condition}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Droplet size={20} className="text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="font-semibold text-primary">{SAMPLE_WEATHER.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wind size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
                <p className="font-semibold text-primary">{SAMPLE_WEATHER.windSpeed} km/h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
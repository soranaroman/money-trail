"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SettingsForm } from "@/components/crud/settings-form";
import { formatEur, formatDate } from "@/lib/format";
import { useData } from "@/lib/data-context";

export default function SetariPage() {
  const { settings, updateSold, updateMarje, updatePassword } = useData();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Setări</h1>
        <p className="text-sm text-muted-foreground">Configurări generale aplicație</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sold curent firmă</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm action={updateSold}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sold">Sold actual (€)</Label>
                <Input
                  id="sold"
                  name="sold_curent"
                  type="number"
                  step="0.01"
                  defaultValue={settings.sold_curent}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="data">Data actualizării</Label>
                <Input
                  id="data"
                  name="sold_updated_at"
                  type="date"
                  defaultValue={today}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Soldul curent e folosit pentru calculul soldului estimat din calendarul de
              obligații. Recomandat să-l actualizezi săptămânal.
            </p>
          </SettingsForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marje setate (pentru calibrator)</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm action={updateMarje}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-neprev">Marjă neprevăzute (%)</Label>
                <Input
                  id="m-neprev"
                  name="marja_neprevazut_setata"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue={settings.marja_neprevazut_setata}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-pierd">Marjă pierderi (%)</Label>
                <Input
                  id="m-pierd"
                  name="marja_pierderi_setata"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue={settings.marja_pierderi_setata}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Procentele-țintă pentru fiecare categorie. Calibratorul de pe dashboard compară
              aceste ținte cu valorile reale.
            </p>
          </SettingsForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cont utilizator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value="demo@moneytrail.app" disabled />
            <p className="text-xs text-muted-foreground">
              Cont demo — datele sunt fictive și se resetează din butonul „Resetează demo”.
            </p>
          </div>
          <Separator />
          <SettingsForm action={updatePassword} submitLabel="Schimbă parola" resetOnSuccess>
            <div className="space-y-1.5">
              <Label htmlFor="parola">Schimbă parola</Label>
              <Input
                id="parola"
                name="password"
                type="password"
                placeholder="Parolă nouă (minim 8 caractere)"
                minLength={8}
                required
              />
            </div>
          </SettingsForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despre aplicație</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            Versiune: <span className="font-medium">MoneyTrail · demo public</span>
          </div>
          <div className="text-muted-foreground text-xs mt-3">
            Sold curent: {formatEur(settings.sold_curent)} · actualizat:{" "}
            {formatDate(settings.sold_updated_at)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

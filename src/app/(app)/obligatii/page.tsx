"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, CalendarClock, AlertTriangle, Pencil } from "lucide-react";
import { formatEur, formatDate } from "@/lib/format";
import { useData } from "@/lib/data-context";
import { expandObligations } from "@/lib/obligations";
import { ObligationFormDialog } from "@/components/crud/obligation-form-dialog";
import { UpdateSoldDialog } from "@/components/crud/update-sold-dialog";
import { DeleteButton } from "@/components/crud/delete-button";

const recurentaLabel: Record<string, string> = {
  lunar: "Lunar",
  trimestrial: "Trimestrial",
  anual: "Anual",
  "one-time": "Unică",
};

export default function ObligatiiPage() {
  const { obligations, settings, deleteObligation } = useData();

  const today = new Date().toISOString().slice(0, 10);
  const evenimente = expandObligations(obligations, today, 60);

  // Sold progresiv pornind de la soldul curent introdus manual
  const evenimenteCuSold = evenimente.map((ev, i) => ({
    ...ev,
    soldDupa:
      settings.sold_curent - evenimente.slice(0, i + 1).reduce((s, e) => s + e.suma, 0),
  }));

  const totalUrm = evenimente.reduce((s, e) => s + e.suma, 0);
  const soldFinal = settings.sold_curent - totalUrm;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Obligații și calendar</h1>
          <p className="text-sm text-muted-foreground">
            {obligations.length} {obligations.length === 1 ? "obligație definită" : "obligații definite"} ·{" "}
            {evenimente.length} {evenimente.length === 1 ? "eveniment" : "evenimente"} în următoarele 60 zile
          </p>
        </div>
        <ObligationFormDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Adaugă obligație
          </Button>
        </ObligationFormDialog>
      </div>

      {/* Status sold */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Sold curent (manual)</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {formatEur(settings.sold_curent)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Actualizat: {formatDate(settings.sold_updated_at)}
            </div>
            <UpdateSoldDialog soldCurent={settings.sold_curent} today={today}>
              <Button variant="outline" size="sm" className="mt-3">
                Actualizează sold
              </Button>
            </UpdateSoldDialog>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Plăți următoarele 60 zile</div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600">
              − {formatEur(totalUrm)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {evenimente.length} evenimente programate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Sold estimat în 60 zile</div>
            <div
              className={`mt-1 text-2xl font-bold tabular-nums ${soldFinal < 500 ? "text-rose-600" : soldFinal < 2000 ? "text-amber-600" : "text-emerald-600"}`}
            >
              {formatEur(soldFinal)}
            </div>
            {soldFinal < 2000 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="size-3" />
                Atenție: sold scăzut
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar 60 zile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-5" />
            <CardTitle>Calendar — următoarele 60 zile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {evenimenteCuSold.map((ev, i) => {
              const culoare =
                ev.soldDupa < 500
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : ev.soldDupa < 2000
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";
              return (
                <div
                  key={i}
                  className="grid grid-cols-[120px_1fr_120px_180px] items-center gap-3 rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <div className="text-muted-foreground">
                    {new Date(ev.data + "T00:00:00").toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </div>
                  <div>
                    <div className="font-medium">{ev.descriere}</div>
                  </div>
                  <div className="text-right font-medium tabular-nums text-rose-600">
                    − {formatEur(ev.suma)}
                  </div>
                  <div
                    className={`rounded border px-2 py-1 text-right text-xs font-medium tabular-nums ${culoare}`}
                  >
                    Sold estimat: {formatEur(ev.soldDupa)}
                  </div>
                </div>
              );
            })}
            {evenimente.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-6">
                Nicio obligație programată în următoarele 60 zile
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista obligatii definite */}
      <Card>
        <CardHeader>
          <CardTitle>Obligații definite</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descriere</TableHead>
                <TableHead>Recurență</TableHead>
                <TableHead>Scadență / ancoră</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Sumă</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {obligations.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.descriere}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {recurentaLabel[o.recurenta]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(o.scadenta)}</TableCell>
                  <TableCell className="text-center">
                    {o.recurenta === "one-time" ? (
                      o.achitat ? (
                        <Badge variant="default" className="text-xs">Achitată</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">De plată</Badge>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">recurentă</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(o.suma)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ObligationFormDialog obligation={o}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          aria-label="Editează"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </ObligationFormDialog>
                      <DeleteButton
                        action={deleteObligation}
                        id={o.id}
                        confirmMessage={`Ștergi obligația „${o.descriere}"?`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {obligations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                    Nicio obligație definită încă — adaugă prima cu butonul de sus.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

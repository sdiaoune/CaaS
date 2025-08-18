import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
  className?: string
}

export function KpiCard({ label, value, change, trend, className }: KpiCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const isPositive = (trend === "up" && change > 0) || (trend === "down" && change < 0)

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={cn("flex items-center gap-1 text-xs", isPositive ? "text-green-600" : "text-red-600")}>
          <TrendIcon className="h-3 w-3" />
          {Math.abs(change)}%
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

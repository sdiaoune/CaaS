"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, XCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Connector } from "@/lib/types"

interface ConnectorCardProps {
  connector: Connector
  onConnect?: () => void
  onConfigure?: () => void
  className?: string
}

export function ConnectorCard({ connector, onConnect, onConfigure, className }: ConnectorCardProps) {
  const statusConfig = {
    connected: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950", label: "Connected" },
    syncing: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950", label: "Syncing" },
    error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950", label: "Error" },
    disconnected: { icon: XCircle, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-950", label: "Disconnected" },
  }

  const config = statusConfig[connector.status]
  const StatusIcon = config.icon

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{connector.name}</CardTitle>
        <Badge variant="outline" className={cn("gap-1", config.bg, config.color)}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {connector.lastSyncAt && (
          <p className="text-xs text-muted-foreground">
            Last sync: {connector.lastSyncAt.toLocaleDateString()} at {connector.lastSyncAt.toLocaleTimeString()}
          </p>
        )}
        {connector.errors && connector.errors.length > 0 && (
          <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">{connector.errors[0]}</div>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={connector.status === "connected" ? "outline" : "default"}
            onClick={onConnect}
            className="flex-1"
            disabled={connector.status === "syncing"}
          >
            {connector.status === "syncing" ? "Syncing..." : connector.status === "connected" ? "Reconnect" : "Connect"}
          </Button>
          {connector.status === "connected" && (
            <Button size="sm" variant="outline" onClick={onConfigure}>
              <Settings className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

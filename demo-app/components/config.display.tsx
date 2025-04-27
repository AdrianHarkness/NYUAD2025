"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { API_URL, FRONTEND_URL } from "@/lib/config"
import React from 'react';

export function ConfigDisplay() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/__debug`, {
          method: "GET",
        })

        if (response.ok) {
          setBackendStatus("online")
        } else {
          setBackendStatus("offline")
        }
      } catch (error) {
        setBackendStatus("offline")
      }
    }

    checkBackend()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-semibold">Backend API URL:</div>
          <div className="font-mono text-sm break-all">{API_URL}</div>

          <div className="font-semibold">Frontend URL:</div>
          <div className="font-mono text-sm break-all">{FRONTEND_URL}</div>

          <div className="font-semibold">Environment:</div>
          <div className="font-mono text-sm">{process.env.NODE_ENV}</div>

          <div className="font-semibold">Backend Status:</div>
          <div>
            {backendStatus === "checking" && "Checking..."}
            {backendStatus === "online" && <span className="text-green-600 font-semibold">Online</span>}
            {backendStatus === "offline" && <span className="text-red-600 font-semibold">Offline</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

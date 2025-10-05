"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Brain, AlertCircle, CheckCircle, FileImage } from "lucide-react"
import Image from "next/image"

interface PredictionResult {
  result: string
  confidence: number
  tumorType: string
  isHealthy: boolean
}

export default function BrainTumorDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setResult(null)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Failed to analyze the image. Please try again.")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getResultColor = (isHealthy: boolean) => {
    return isHealthy ? "text-green-600" : "text-orange-600"
  }

  const getResultIcon = (isHealthy: boolean) => {
    return isHealthy ? CheckCircle : AlertCircle
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading text-foreground">Brain Tumor Detection System</h1>
              <p className="text-muted-foreground">AI-powered MRI analysis for tumor detection and classification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload MRI Image
              </CardTitle>
              <CardDescription>Select a brain MRI image for tumor detection analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mri-upload">MRI Image File</Label>
                <Input
                  id="mri-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>Image Preview</Label>
                  <div className="relative aspect-square w-full max-w-sm mx-auto border rounded-lg overflow-hidden bg-muted">
                    <Image src={previewUrl || "/placeholder.svg"} alt="MRI Preview" fill className="object-cover" />
                  </div>
                </div>
              )}

              <Button onClick={handleAnalyze} disabled={!selectedFile || isAnalyzing} className="w-full" size="lg">
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Image
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>AI-powered tumor detection and classification results</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !isAnalyzing && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an MRI image to begin analysis</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Analyzing MRI image...</p>
                  </div>
                  <Progress value={65} className="w-full" />
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Main Result */}
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className={`flex items-center justify-center gap-2 mb-2 ${getResultColor(result.isHealthy)}`}>
                      {(() => {
                        const Icon = getResultIcon(result.isHealthy)
                        return <Icon className="h-6 w-6" />
                      })()}
                      <h3 className="text-xl font-semibold font-heading">{result.result}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.isHealthy ? "No tumor detected in the MRI scan" : `${result.tumorType} tumor detected`}
                    </p>
                  </div>

                  {/* Confidence Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Confidence Score</Label>
                      <Badge variant={result.confidence > 0.8 ? "default" : "secondary"}>
                        {(result.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={result.confidence * 100} className="w-full" />
                    <p className="text-xs text-muted-foreground">Higher confidence indicates more reliable results</p>
                  </div>

                  {/* Additional Information */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> This AI analysis is for research purposes only. Always consult with
                      qualified medical professionals for proper diagnosis and treatment.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

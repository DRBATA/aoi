'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: Error) => void
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    // Initialize the reader
    readerRef.current = new BrowserMultiFormatReader()

    return () => {
      // Cleanup on unmount
      if (readerRef.current) {
        readerRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current) return

    try {
      setIsScanning(true)
      setError(null)

      // Request camera permission and get devices
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera
      })
      
      // Permission granted
      setCameraPermission('granted')

      // Get video devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found')
      }

      // Use the first available camera (or back camera if available)
      const selectedDevice = videoDevices.find(device => 
        device.label.toLowerCase().includes('back')
      ) || videoDevices[0]

      // Start decoding from video device
      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText()
            console.log('QR Code scanned:', text)
            onScan(text)
            stopScanning()
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error('Scan error:', error)
            if (onError) onError(error)
          }
        }
      )

      // Stop the initial stream we requested for permission
      stream.getTracks().forEach(track => track.stop())

    } catch (err) {
      console.error('Camera error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMessage)
      setCameraPermission('denied')
      setIsScanning(false)
      
      if (onError && err instanceof Error) {
        onError(err)
      }
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setIsScanning(false)
  }

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-75">Click start to scan QR code</p>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-4 border-purple-500/50 rounded-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1 w-3/4 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <CameraOff className="w-4 h-4 inline mr-2" />
          {error}
          {cameraPermission === 'denied' && (
            <p className="mt-2 text-xs">
              Please enable camera permissions in your browser settings.
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <CameraOff className="w-5 h-5" />
            Stop Camera
          </button>
        )}
      </div>
    </div>
  )
}

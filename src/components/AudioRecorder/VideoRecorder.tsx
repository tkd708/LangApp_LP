import { Button } from 'src/components/lv1'
import React, { FC, useState, useEffect, useRef, useMemo } from 'react'
import { SUPPORT_COLOR } from 'src/constants/colors'
import { Box, Image, Text } from '@chakra-ui/core'
import { useTimer } from 'src/hooks/useTimer'

type VideoRecorderProps = {
  limitSeconds: number
  setBlobRecord: (data: Blob) => void
}

const PreparingTimeLimit = 3

export const VideoRecorder: FC<VideoRecorderProps> = ({
  limitSeconds,
  setBlobRecord,
}) => {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [data, setData] = useState<Blob | null>(null)
  const streamVideoRef = useRef<HTMLVideoElement>(null)
  const { startTimer: startPreparing, time: preparingTime } = useTimer({
    limit: PreparingTimeLimit,
    onStart: () => setPreparing(true),
    onEnd: () => {
      setPreparing(false)
      startRecording()
    },
  })

  const {
    startTimer: startRecording,
    endTimer: stopRecording,
    time: recordingTime,
  } = useTimer({
    limit: limitSeconds,
    onStart: () => setRecording(true),
    onEnd: () => {
      setRecording(false)
    },
  })

  useEffect(() => {
    initRecorder()
  }, [])

  useEffect(() => {
    recording
      ? recorder && recorder.state === 'inactive' && recorder.start()
      : recorder && recorder.state === 'recording' && recorder.stop()
  }, [recording])

  const initRecorder = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
        },
      })
      .then((stream) => startStream(stream))
      .catch((error) => {
        if (error instanceof ReferenceError) {
          alert(
            'お使いのブラウザでは動画を録画できません\n最新のGoogle Chromeをお使いください'
          )
        } else {
          alert(
            'エラーが発生しました\nURLバー左の i のマークから、カメラを許可してください'
          )
        }
      })
  }

  const startStream = (stream: MediaStream) => {
    if (streamVideoRef.current) streamVideoRef.current.srcObject = stream
    if (streamVideoRef.current) streamVideoRef.current.play()
    const newRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    })

    newRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        setBlobRecord(event.data)
        setData(event.data)
      }
    })
    setRecorder(newRecorder)
  }

  const StreamVideoMemo = useMemo(
    () => (
      <Box position="relative">
        <video
          ref={streamVideoRef}
          muted
          className="video_with_flip_horizontal_controller"
          style={{
            // maxWidth: 700,
            borderRadius: 8,
            overflow: 'hidden',
            transform: 'scaleX(-1)',
          }}
        />
        <Box
          d={preparing ? 'flex' : 'none'}
          alignItems="center"
          justifyContent="center"
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          <Box fontSize={72} color="#fff">
            {PreparingTimeLimit - preparingTime}
          </Box>
        </Box>
      </Box>
    ),
    [preparingTime, preparing]
  )

  const RecordedVideoMemo = useMemo(
    () =>
      data && (
        <video
          controls
          src={URL.createObjectURL(new Blob([data], { type: data.type }))}
          className="video_with_flip_horizontal_controller"
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            transform: 'scaleX( -1 )',
          }}
        />
      ),
    [data]
  )

  const showStraemVideo = preparing || recording || !data

  return (
    <>
      <Box position="relative" display={showStraemVideo ? 'block' : 'none'}>
        {StreamVideoMemo}
        <Box
          position="absolute"
          top={2}
          right={2}
          d="flex"
          alignItems="center"
          p={2}
          borderRadius={8}
          backgroundColor="#fff"
        >
          <Image src="/ClockRed.svg" size={6} mr={3} />
          <Text mr={2} fontSize={12} color="gray.700">
            {limitSeconds - recordingTime}秒
          </Text>
        </Box>
      </Box>
      {!showStraemVideo && RecordedVideoMemo}
      {recording ? (
        <Button onClick={stopRecording} isOutline color={SUPPORT_COLOR}>
          録画を終了する
        </Button>
      ) : (
        <Button onClick={startPreparing} isPrimary isDisabled={preparing}>
          {data ? '動画を撮り直す' : '録画を開始する'}
        </Button>
      )}
    </>
  )
}

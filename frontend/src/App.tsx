import { Box, Container, Heading, Text, Button, VStack, Image, Input, Spinner, useToast, SimpleGrid } from '@chakra-ui/react'
import { useState } from 'react'
import axios from 'axios'


function App() {
  //
  //State
  //

  //選んだ画像ファイル
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  //選んだ画像のプレビュー
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  //AI加工後の画像
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  //ローディング中かどうか
  const [isLoading, setIsLoading] = useState(false)
  //トースト
  const toast = useToast()

  //
  //イベントハンドラー
  //

  //ファイル選択
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      //ブラウザ上で表示する仮のURLを作成
      setPreviewUrl(URL.createObjectURL(file))
      setResultUrl(null) //新しい画像を選んだら古い画像を消す
    }
  }

  //「加工する」ボタン押したとき
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true) //ローディング開始

    //データを送るためのFormDataを作成
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      //バックエンドにPOSTリクエストを送る(POST/process-image)
      //responseTypeをblobにすることで、バイナリデータを返すようにする
      const response = await axios.post('http://127.0.0.1:8000/process-image', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      //返ってきた画像データ(blob)を表示できるURLに変換
      const processedImageUrl = URL.createObjectURL(response.data)
      setResultUrl(processedImageUrl)

      toast({
        title: '加工完了！',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error(error)
      toast({
        title: 'エラーが発生しました',
        description: '起動しているか確認してください',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false) //ローディング終了
    }
  }

  // 「背景をぼかす」ボタンが押された時
  const handleBlurUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true) //ローディング開始

    //データを送るためのFormDataを作成
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      //バックエンドにPOSTリクエストを送る(POST/process-image-blur)
      //responseTypeをblobにすることで、バイナリデータを返すようにする
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await axios.post(`${apiUrl}/process-image-blur`, formData, {
        responseType: 'blob',
        headers: { "Content-Type": "multipart/form-data" }
      })

      //返ってきた画像データ(blob)を表示できるURLに変換
      const processedImageUrl = URL.createObjectURL(response.data)
      setResultUrl(processedImageUrl)

      toast({
        title: "ぼかし加工完了！",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

    } catch (error) {
      console.error(error)
      toast({
        title: "エラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false) //ローディング終了
    }
  }

  //
  //画面の描画(JSX)
  //
  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8}>

        {/* タイトル */}
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>
            Sales Studio
          </Heading>
          <Text fontSize="xl" color="gray.600">
            商品画像の背景を加工します
          </Text>
        </Box>

        {/* 画像表示 */}
        <Box display="flex" gap={4} flexDirection={{ base: 'column', md: 'row' }}>

          {/* アップロードエリア */}
          <Box flex={1} borderWidth="2px" borderRadius="lg" borderStyle="dashed" p={4} textAlign="center">
            <Text mb={2} fontWeight="bold">Before (元の画像)</Text>

            {previewUrl ? (
              //画像があるとき
              <Image src={previewUrl} alt="Preview" maxH="300px" mx="auto" objectFit="contain" />
            ) : (
              //画像がないとき
              <Box h="200px" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
                <Text color="gray.400">画像をアップロードしてください</Text>
              </Box>
            )}

            {/* ファイル選択ボタン */}
            <Input type="file" accept="image/*" onChange={handleFileChange} mt={4} pt={1} />
          </Box>

          {/* 結果エリア */}
          {resultUrl && (
            <Box flex={1} borderWidth="2px" borderRadius="lg" borderColor="green.200" p={4} textAlign="center" bg="green.50">
              <Text mb={2} fontWeight="bold" color="green.700">After (加工後の画像)</Text>
              <Image src={resultUrl} alt="Result" maxH="300px" mx="auto" objectFit="contain" />

              {/* 画像をダウンロードするボタン */}
              <Button as="a" href={resultUrl} download="processed_image.jpg" colorScheme="green" mt={4} size="sm">
                画像を保存する
              </Button>
            </Box>
          )}
        </Box>

        {/* 加工ボタン */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
          <Button
            colorScheme="blue"
            size="lg"
            width={1}
            onClick={handleUpload} //白背景加工
            isLoading={isLoading} //通信中はボタンを押せないようにする
            loadingText="加工中..."
            isDisabled={!selectedFile} //画像を選択していないときは押せないようにする
          >
            背景を削除して白くする
          </Button>

          <Button
            colorScheme="teal"
            size="lg"
            width={1}
            onClick={handleBlurUpload} //ぼかし加工
            isLoading={isLoading} //通信中はボタンを押せないようにする
            loadingText="加工中..."
            isDisabled={!selectedFile} //画像を選択していないときは押せないようにする
          >
            背景をぼかす
          </Button>
        </SimpleGrid>
      </VStack>
    </Container>
  )
}

export default App

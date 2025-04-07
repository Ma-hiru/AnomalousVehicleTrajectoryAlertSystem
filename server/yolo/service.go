package yolo

import (
	"fmt"
	"gocv.io/x/gocv"
	"image"
	"image/color"
)

func Init(modelPath, imagePath, outputPath string) {
	img := gocv.IMRead(imagePath, gocv.IMReadColor)
	if img.Empty() {
		fmt.Printf("Error loading image: %v\n", imagePath)
		return
	}
	defer img.Close()
	net := gocv.ReadNetFromONNX(modelPath)
	if net.Empty() {
		fmt.Printf("Error loading model: %v\n", modelPath)
		return
	}
	defer net.Close()
	//if err := net.SetPreferableBackend(gocv.NetBackendCUDA); err != nil {
	//	log.Fatalf("设置 CUDA 后端失败: %v", err)
	//}
	//if err := net.SetPreferableTarget(gocv.NetTargetCUDA); err != nil {
	//	log.Fatalf("设置 CUDA 目标失败: %v", err)
	//}
	outputNames := getOutputNames(&net)
	if len(outputNames) == 0 {
		fmt.Println("Error getting output layers")
		return
	}
	detect(&net, &img, outputNames)
	if ok := gocv.IMWrite(outputPath, img); ok {
		fmt.Printf("Result saved to: %s\n", outputPath)
	} else {
		fmt.Println("Failed to save image")
	}
	window := gocv.NewWindow("Detection Result")
	defer window.Close()
	window.IMShow(img)
	window.WaitKey(0)
}

var (
	ratio    = 0.003921568627
	mean     = gocv.NewScalar(0, 0, 0, 0)
	swapRGB  = false
	padValue = gocv.NewScalar(144.0, 0, 0, 0)

	scoreThreshold float32 = 0.5
	nmsThreshold   float32 = 0.4
)

func detect(net *gocv.Net, src *gocv.Mat, outputNames []string) {
	params := gocv.NewImageToBlobParams(ratio, image.Pt(640, 640), mean, swapRGB, gocv.MatTypeCV32F, gocv.DataLayoutNCHW, gocv.PaddingModeLetterbox, padValue)
	blob := gocv.BlobFromImageWithParams(*src, params)
	defer blob.Close()

	// feed the blob into the detector
	net.SetInput(blob, "")

	// run a forward pass through the network
	probs := net.ForwardLayers(outputNames)
	defer func() {
		for _, prob := range probs {
			prob.Close()
		}
	}()

	boxes, confidences, classIds := performDetection(probs)
	if len(boxes) == 0 {
		fmt.Println("No classes detected")
		return
	}

	iboxes := params.BlobRectsToImageRects(boxes, image.Pt(src.Cols(), src.Rows()))
	indices := gocv.NMSBoxes(iboxes, confidences, scoreThreshold, nmsThreshold)
	drawRects(src, iboxes, classes, classIds, indices)
}

func getOutputNames(net *gocv.Net) []string {
	var outputLayers []string
	for _, i := range net.GetUnconnectedOutLayers() {
		layer := net.GetLayer(i)
		layerName := layer.GetName()
		if layerName != "_input" {
			outputLayers = append(outputLayers, layerName)
		}
	}

	return outputLayers
}

func performDetection(outs []gocv.Mat) ([]image.Rectangle, []float32, []int) {
	var classIds []int
	var confidences []float32
	var boxes []image.Rectangle

	// needed for yolov8
	gocv.TransposeND(outs[0], []int{0, 2, 1}, &outs[0])

	for _, out := range outs {
		out = out.Reshape(1, out.Size()[1])

		for i := 0; i < out.Rows(); i++ {
			cols := out.Cols()
			scoresCol := out.RowRange(i, i+1)

			scores := scoresCol.ColRange(4, cols)
			_, confidence, _, classIDPoint := gocv.MinMaxLoc(scores)

			if confidence > 0.5 {
				centerX := out.GetFloatAt(i, cols)
				centerY := out.GetFloatAt(i, cols+1)
				width := out.GetFloatAt(i, cols+2)
				height := out.GetFloatAt(i, cols+3)

				left := centerX - width/2
				top := centerY - height/2
				right := centerX + width/2
				bottom := centerY + height/2
				classIds = append(classIds, classIDPoint.X)
				confidences = append(confidences, confidence)

				boxes = append(boxes, image.Rect(int(left), int(top), int(right), int(bottom)))
			}
		}
	}

	return boxes, confidences, classIds
}

func drawRects(img *gocv.Mat, boxes []image.Rectangle, classes []string, classIds []int, indices []int) []string {
	var detectClass []string
	for _, idx := range indices {
		if idx == 0 {
			continue
		}
		gocv.Rectangle(img, image.Rect(boxes[idx].Min.X, boxes[idx].Min.Y, boxes[idx].Max.X, boxes[idx].Max.Y), color.RGBA{0, 255, 0, 0}, 2)
		gocv.PutText(img, classes[classIds[idx]], image.Point{boxes[idx].Min.X, boxes[idx].Min.Y - 10}, gocv.FontHersheyPlain, 0.6, color.RGBA{0, 255, 0, 0}, 1)
		detectClass = append(detectClass, classes[classIds[idx]])
	}

	return detectClass
}

var classes = []string{
	"person", "bicycle", "car", "motorbike", "aeroplane", "bus", "train", "truck", "boat", "pig",
	// ... 根据你使用的模型的类别进行扩展
}

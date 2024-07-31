import store from '@/redux/store'
import '@/lib/fabric/fabric'
import { hitShapeTypes } from '@/constants'
import { hexToRgba } from '@/helpers/Utils'
// @ts-ignore
const fabric = window.fabric

export const renderModelInfer = (inferRes) => {
    if(inferRes.length === 0) return
    const { project } = store.getState()
    const { projectDetails, currentHit, currentImgInfo, currentCanvas, entityColorMap, currentEntity } = project
    // 当前图像的缩略图切割信息
    const { sliceX, sliceY } = currentImgInfo
    console.log(inferRes)
    inferRes?.map((box, index)=>{
        box.label = box.label || []
        const color = entityColorMap[box.label[0]] || '#000000'
        const id = box.id
        console.log(box.type)
        switch(box.type){
            case 'rect':{
                const _rect = new fabric.Rect({
                    id: id || Date.now(),
                    left: box.points[0][0],
                    top: box.points[0][1],
                    width: box.points[2][0] - box.points[0][0],
                    height: box.points[2][1] - box.points[0][1],
                    fill: false,
                    stroke: color,
                    strokeWidth: 5,
                    // opacity: 0.4,
                    opacity: 1,
                    erasable: false,
                    label: box.label,
                    shape: hitShapeTypes.RECT,
                })
                _rect.left -= sliceX
                _rect.top -= sliceY
                _rect.setCoords()
                currentCanvas.add(_rect)
                break
            }
            case 'yoloRect':{
                const _rect = new fabric.Rect({
                    id: id || Date.now(),
                    left: box.points[0][0],
                    top: box.points[0][1],
                    width: box.points[2][0] - box.points[0][0],
                    height: box.points[2][1] - box.points[0][1],
                    fill: false,
                    stroke: color,
                    strokeWidth: 5,
                    // opacity: 0.4,
                    opacity: 1,
                    erasable: false,
                    label: box.label,
                    shape: hitShapeTypes.RECT,
                })
                _rect.left -= sliceX
                _rect.top -= sliceY

                const text = new fabric.Text(box.label[0], {
                    fontSize: 16,
                    fill: 'white',
                    textBackgroundColor: _rect.stroke,
                    left: _rect.left,
                    top: _rect.top - 18,
                })
                const _group = new fabric.Group([_rect, text])
                _group.label = box.label
                _group.setCoords()
                currentCanvas.add(_group)
                break
            }
            case 'path':{
                const _path = new fabric.Path(
                    box.points.map(point => {
                        if (point[0] === 'M' || point[0] === 'L') {
                            return [point[0], point[1], point[2]]
                        }
                        if (point[0] === 'Q')
                            return [
                                'Q',
                                point[1],
                                point[2],
                                point[3],
                                point[4],
                            ]
                    }),
                    {
                        id: id || Date.now(),
                        fill: box.fill || hexToRgba(color, 0.4),
                        strokeWidth: 5,
                        stroke: color,
                        label: box.label,
                        shape: hitShapeTypes.PATH,
                        // lockMovementX: true,
                        // lockMovementY: true,
                        lockRotation: true,
                        lockScalingFlip: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockSkewingX: true,
                        lockSkewingY: true,
                        erasable: false,
                    })
                _path.left -= sliceX
                _path.top -= sliceY
                _path.setCoords()
                currentCanvas.add(_path)
                break
            }
            case 'asm_path':{
                const _path = new fabric.Path(box.path, {
                    id: id || Date.now(),
                    fill: hexToRgba(color, 0.4),
                    // fill: false,
                    strokeWidth: 5,
                    stroke: color,
                    label: box.label,
                    shape: hitShapeTypes.PATH,
                    // lockMovementX: true,
                    // lockMovementY: true,
                    lockRotation: true,
                    lockScalingFlip: true,
                    lockScalingX: true,
                    lockScalingY: true,
                    lockSkewingX: true,
                    lockSkewingY: true,
                    erasable: false,
                })
                _path.left -= sliceX
                _path.top -= sliceY
                _path.setCoords()
                currentCanvas.add(_path)
                break
            }
        }
    })
}
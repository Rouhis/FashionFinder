import React, { useState, useEffect } from 'react'

const DynamicMask = () => {
  const [imageSource, setImageSource] = useState("")

  useEffect(() => {
    const timeStamp = new Date().getTime()
    const updatedImageSource = `../assets/data/mask.png?t=${timeStamp}`
    setImageSource(updatedImageSource)
  }, [imageSource])

  return (
    <div>
      <img src={imageSource} alt="Dynamically Updated Image" />
    </div>
  )
}

export default DynamicMask
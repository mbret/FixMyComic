/**
 * @see https://react-dropzone.js.org/
 */
import React, { memo } from 'react';
import { useDropzone } from 'react-dropzone'
import { useState, useDispatch } from './flow';

export const DropBox = memo(() => {
  const dispatch = useDispatch()
  const files = useState(state => state.files)
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'application/epub+zip',
    onDrop: (acceptedFiles: File[]) => {
      dispatch({ type: 'UPDATE_FILES', payload: acceptedFiles })
    }
  })

  return (
    <div
      style={{
        border: '1px solid gray',
        padding: 20,
        marginBottom: 20
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {files.length
        ? (
          files.map(file => (
            <p key={file}>{file}</p>
          ))
        )
        : (
          <p>Drag and drop some files here. Only <b>.epub</b> are supported at the time.</p>
        )}
    </div>
  )
});
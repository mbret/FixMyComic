import React from 'react';
import { useDropzone } from 'react-dropzone'
import { useFlow } from './flow';
import * as effects from './effects';
import { reducer, initialState } from './reducers';

export const DropBox = () => {
  const { state, dispatch } = useFlow()
  // const styles = useStyles()
  const { getRootProps, getInputProps } = useDropzone({
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
      {state.files.length
        ? (
          state.files.map(file => (
            <p key={file}>{file}</p>
          ))
        )
        : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
    </div>
  )
};
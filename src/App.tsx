import React from 'react';
import { useDropzone } from 'react-dropzone'
import { useFlow } from './utils';
import * as effects from './effects';
import { reducer, initialState } from './reducers';
import { ProgressBar, Button, Alert, Spinner } from 'react-bootstrap';

const App = () => {
  const [state, dispatch] = useFlow(reducer, initialState, Object.values(effects))

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      dispatch({ type: 'UPDATE_FILES', payload: acceptedFiles })
    }
  })

  return (
    <div style={{
      backgroundColor: 'white'
    }}>
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
      <Button
        variant="success"
        disabled={state.fixing || state.files.length === 0}
        onClick={_ => {
          dispatch({ type: 'FIX_START' })
        }}
      >
        {!state.fixing
          ? 'Fix my layout !'
          : (
            <>
              <Spinner size="sm" animation="border" /> Processing...
            </>
          )}
      </Button>
      <div style={{
        marginTop: 10
      }}>
        {state.fixingProgress === 100
          ? (
            <Alert variant="success">
              Your comic has been fixed with success
            </Alert>
          ) : (
            <ProgressBar now={state.fixingProgress} animated={false} variant="success" />
          )}
      </div>
    </div>
  )
};

export default App;

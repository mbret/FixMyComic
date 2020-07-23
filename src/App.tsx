import React from 'react';
import { useDropzone } from 'react-dropzone'
import { useFlow } from './utils';
import * as effects from './effects';
import { reducer, initialState } from './reducers';
import { ProgressBar, Button, Alert, Spinner, Dropdown, DropdownButton } from 'react-bootstrap';

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <div style={{
            marginRight: 10
          }}>Input format</div>
          <DropdownButton title={state.selectedInputFormat} variant="info">
            <Dropdown.Item href="#/action-1">epub-calibre</Dropdown.Item>
          </DropdownButton>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <div style={{
            marginRight: 10
          }}>Output format</div>
          <DropdownButton title="fixed-layout" variant="info">
            <Dropdown.Item href="#/action-1">fixed-layout</Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
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

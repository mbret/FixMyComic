import React, { ChangeEvent } from 'react';
import { useFlow } from './flow';
import { ProgressBar, Button, Alert, Spinner, Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { DropBox } from './DropBox';

export const Home = () => {
  const { state, dispatch } = useFlow()
  const styles = useStyles()

  return (
    <div style={{
      backgroundColor: 'white'
    }}>
      <Alert variant="info">
        <Alert.Heading style={styles.title}>Hello there</Alert.Heading>
        <p style={styles.text}>
          This app provide a quick and painless way to apply a fixed layout to your comic. This is required
          by some reading app (Kindle, Google Play Book, ...)
          in order to display an epub with images (manga, comic) correctly, without unwanted margins for example.
        </p>
        <hr />
        <p className="mb-0" style={styles.text}>
          <b>This is a development version.</b>
          It is recommended  that you keep the option <b>Keep a backup of the original file</b> checked for now.
        </p>
      </Alert>
      <DropBox />
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
      <Form>
        <Form.Group >
          <Form.Check
            id="rtl"
            type="checkbox"
            label="Apply right to left behavior"
            checked={state.rtl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              dispatch({ type: 'UPDATE_FORM', payload: { rtl: e.target.checked } })
            }}
          />
        </Form.Group>
        <Form.Group controlId="formBasicCheckbox">
          <Form.Check
            type="checkbox"
            label="Keep a backup of the original file"
            readOnly
            checked={state.backup}
          />
        </Form.Group>
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
      </Form>
      <div style={{
        marginTop: 10
      }}>
        {state.lastFixingError && (
          <Alert variant="danger">
            An error occured during the process
          </Alert>
        )}
        {state.fixingProgress === 100 && (
          <Alert variant="success">
            Your comic has been fixed with success
          </Alert>
        )}
        {}
        {state.fixing && (
          <ProgressBar now={state.fixingProgress} animated={false} variant="success" />
        )}
      </div>
    </div>
  )
};

const useStyles = () => ({
  title: {
    fontSize: 20,
  },
  text: {
    fontSize: 14,
  },
})

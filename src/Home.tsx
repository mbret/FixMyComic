import React, { ChangeEvent } from 'react';
import { useState, useDispatch } from './flow';
import { ProgressBar, Button, Alert, Spinner, Dropdown, DropdownButton, Form, Tabs, Tab, Badge, Col } from 'react-bootstrap';
import { DropBox } from './DropBox';
import { getTotalFixingProgress } from './reducers';

export const Home = () => {
  const dispatch = useDispatch()
  const state = useState()
  const fixingProgress = useState(getTotalFixingProgress)
  const styles = useStyles()

  return (
    <div style={{
      backgroundColor: 'white'
    }}>
      <Alert variant="warning">
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
          marginBottom: 10,
        }}>
          <div style={{
            marginRight: 10
          }}>Output format</div>
          <DropdownButton title="epub" variant="info">
            <Dropdown.Item href="#/action-1">.epub</Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
      <Form>
        <div style={{
          marginBottom: 10,
        }}>
          <Tabs
            id="controlled-tab-example"
          >
            <Tab eventKey="home" title="Google Drive" >
              <div style={{
                padding: 15,
                backgroundColor: 'rgba(73, 80, 87, 0.2)'
              }}>
                Nothing specific for Google Drive at the moment
              </div>
            </Tab>
          </Tabs>
        </div>
        <Form.Group >
          <Form.Row>
            <Col>
              <Form.Check
                id="fixLayout"
                type="checkbox"
                label="Apply a fix layout to epub"
                checked={state.fixedLayout}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  dispatch({ type: 'UPDATE_FORM', payload: { fixedLayout: e.target.checked } })
                }}
              />
            </Col>
            <Form.Label >
              <Badge variant="secondary">epub2</Badge>&nbsp;
              <Badge variant="info">epub3</Badge>
            </Form.Label>
          </Form.Row>
        </Form.Group>
        <Form.Group >
          <Form.Row>
            <Col>
              <Form.Check
                id="createOrFixAppleOptions"
                type="checkbox"
                label="Create or fix com.apple.ibooks.display-options"
                checked={state.createOrFixAppleOptions}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  dispatch({ type: 'UPDATE_FORM', payload: { createOrFixAppleOptions: e.target.checked } })
                }}
              />
            </Col>
            <Form.Label >
              <Badge variant="secondary">epub2</Badge>&nbsp;
              <Badge variant="info">epub3</Badge>
            </Form.Label>
          </Form.Row>
        </Form.Group>
        <Form.Group >
          <Form.Row>
            <Col>
              <Form.Check
                id="rtl"
                type="checkbox"
                label="Apply right to left reading"
                checked={state.rtl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  dispatch({ type: 'UPDATE_FORM', payload: { rtl: e.target.checked, fixedLayout: state.fixedLayout } })
                }}
              />
            </Col>
            <Form.Label >
              <Badge variant="secondary">epub2</Badge>&nbsp;
              <Badge variant="info">epub3</Badge>
            </Form.Label>
          </Form.Row>
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
            ? 'Fix my comic !'
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
        {fixingProgress === 100 && (
          <Alert variant="success">
            Your comic has been fixed with success
          </Alert>
        )}
        {}
        {state.fixing && (
          <ProgressBar now={fixingProgress} animated={false} variant="success" />
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

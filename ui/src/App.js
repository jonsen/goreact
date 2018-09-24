import React, { Component } from 'react';
import { Button } from 'reactstrap';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.handleGetJson = this.handleGetJson.bind(this);
    this.handleEcho = this.handleEcho.bind(this);
  }

  handleGetJson() {
    fetch('/api/json')
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        alert("done.");
        console.log(json);
      })
      .catch(function(ex) {
        console.log('parsing failed', ex)
      });
  }

  handleEcho() {
    fetch('/api/echo', {
       method: 'POST',
       body: '{"body":{"user":"good man", "email":"test@test.com"}}',
    })
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        alert("done.");
        console.log(json);
      })
      .catch(function(ex) {
        console.log('parsing failed', ex)
      });

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Button color="primary" onClick={this.handleGetJson}>Get Json</Button>{' '}
        <Button color="secondary" onClick={this.handleEcho}>Post Echo</Button>{' '}
      </div>
    );
  }
}

export default App;

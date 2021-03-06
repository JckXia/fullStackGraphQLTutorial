import React, { Component } from "react";

class AuthPage extends Component {
  state = {
    isLogin: true
  };
  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  submitHandler = event => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;
    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
      query {
        login(email: "${email}", password: "${password}") {
          token
        }
      }
      `
    };
    if (!this.state.isLogin) {
      requestBody = {
        query: `
        mutation{
            createUser(userInput:{email:"${email}",password:"${password}"}){
              _id
              email
            }
          }
        `
      };
    }

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        alert("Success!");
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <input />
        </div>
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={this.emailEl} />
        </div>
        <div className="form-control">
          <label htmlFor="password">password</label>
          <input type="password" id="password" ref={this.passwordEl} />
        </div>
        <div className="form-actions">
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? " SignUp " : " Login"}
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    );
  }
}

export default AuthPage;

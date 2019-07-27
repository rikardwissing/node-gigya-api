"use strict";

require("dotenv").config();

const axios = require("axios");
const querystring = require("querystring");

class GigyaApi {
  constructor(loginToken) {
    this.setLoginToken(loginToken);
  }

  setLoginToken(loginToken) {
    this.loginToken = loginToken;
  }

  async call(endpoint, params = {}) {
    if (endpoint !== "accounts.login") {
      params = {
        login_token: this.loginToken,
        authMode: "cookie",
        ...params
      };
    }

    const response = await axios.post(
      `${process.env.GIGYA_API_ROOT}/${endpoint}`,
      querystring.stringify({
        ApiKey: process.env.GIGYA_API_KEY,
        ...params
      })
    );

    if (response.data.errorDetails) {
      throw Error(response.data.errorDetails);
    }

    return response.data;
  }

  async fetchLoginToken(loginID, password) {
    const data = await this.call("accounts.login", { loginID, password });
    const { cookieValue } = data.sessionInfo;
    return cookieValue;
  }

  async fetchPersonId() {
    const data = await this.call("accounts.getAccountInfo");
    const { personId } = data.data;
    return personId;
  }

  async fetchJWTToken() {
    const data = await this.call("accounts.getJWT", {
      fields: "data.personId,data.gigyaDataCenter"
    });

    const { id_token } = data;
    return id_token;
  }
}

module.exports = GigyaApi;

import { simulation, scenario, StringBody, bodyString, stressPeakUsers, group, atOnceUsers, global, getParameter, getEnvironmentVariable, repeat } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

const BASIC_AUTH_USERNAME = getEnvironmentVariable('BASIC_AUTH_USERNAME', ''); // use `export BASIC_AUTH_USERNAME=<username>`
const BASIC_AUTH_PASSWORD = getEnvironmentVariable('BASIC_AUTH_PASSWORD', ''); // use `export BASIC_AUTH_PASSWORD=<password>`

export default simulation((setUp) => {
  const httpProtocol = http
    .baseUrl("http://localhost:4000/graphql")
    .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0"
    )
    .basicAuth(BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD);

  const scn = scenario("Login and Send 20 Authenticated Requests")
  .exec(
    http('Login Request')
      .post('http://localhost:4000/graphql')
      .body(StringBody(JSON.stringify({
        operationName: 'MyMutation',
        query: 'mutation MyMutation {\n  _loginWithLocal(input: {email: \"vietnt2@paditech.com\", password: \"Viet123@\"}) {\n    accessToken\n    refreshToken\n  }\n}\n',
        variables: null
      })))
      .asJson()
      .check(
        status().is(200),
        bodyString().transform(body => {
          console.log('running')
          return JSON.parse(body).data._loginWithLocal.accessToken;
        }).saveAs('authToken')
      )
  )
  .repeat(20).on( // send 20 authenticated requests
    http('Authenticated Request')
      .post('http://localhost:4000/graphql')
      .header("Authorization", session => {
        return `Bearer ${session.get("authToken")}`
      })
      .body(StringBody(JSON.stringify({
        operationName: 'MyQuery',
        query: 'query MyQuery {\n  users {\n    nodes {\n      email\n      id\n    }\n  }\n}',
        variables: null
      })))
      .asJson()
      .check(
        status().is(200),
        bodyString().transform(body => {
          return JSON.parse(body).data.users.nodes.length > 0
        })
      )
  );

  setUp(
    scn.injectOpen(atOnceUsers(15))
  ).protocols(httpProtocol);
});

import { simulation, scenario, stressPeakUsers, atOnceUsers, global, getParameter, getEnvironmentVariable } from "@gatling.io/core";
import { http } from "@gatling.io/http";

const BASIC_AUTH_USERNAME = getEnvironmentVariable('BASIC_AUTH_USERNAME', ''); // use `export BASIC_AUTH_USERNAME=<username>`
const BASIC_AUTH_PASSWORD = getEnvironmentVariable('BASIC_AUTH_PASSWORD', ''); // use `export BASIC_AUTH_PASSWORD=<password>`

export default simulation((setUp) => {
  const httpProtocol = http
    .baseUrl("https://dev.live.boosty.app/")
    .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0"
    )
    .basicAuth(BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD);

  const scn = scenario("No code scenario").exec(
    http("GET Home").get("/")
  );

  setUp(
    scn.injectOpen(stressPeakUsers(20).during(2))
  ).protocols(httpProtocol);
});

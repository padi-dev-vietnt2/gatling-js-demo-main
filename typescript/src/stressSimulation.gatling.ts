import { simulation, scenario, stressPeakUsers, atOnceUsers, global, getParameter } from "@gatling.io/core";
import { http } from "@gatling.io/http";

export default simulation((setUp) => {
  const httpProtocol = http
    .baseUrl("https://ecomm.gatling.io")
    .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0"
    );

  const scn = scenario("No code scenario").exec(
    http("GET Home").get("/")
  );

  setUp(
    scn.injectOpen(stressPeakUsers(20).during(2))
  ).protocols(httpProtocol);
});

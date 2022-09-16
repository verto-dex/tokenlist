const { test } = require("uvu");
const https = require("https");
const assert = require("uvu/assert");
const {
  getVersionUpgrade,
  minVersionBump,
  VersionUpgrade,
} = require("@uniswap/token-lists");
const schema = require("./schema");

test("Main List - Validate Schema", () => {
  const list = getCurrentMainList();
  schema.parse(list);
});

test("Main List - Validate Correct Bump", async () => {
  const masterList = await getListFromMaster("tokenlist.json");
  const current = getCurrentMainList();
  const bump = getVersionUpgrade(masterList.version, current.version);
  const min = minVersionBump(masterList.tokens, current.tokens);
  assert.ok(
    bump >= min,
    `Version bump needs to be bigger than min. Got: ${
      VersionUpgrade[`${bump}`]
    }, needs=${VersionUpgrade[`${min}`]}`
  );
});

test("Community List - Validate Schema", () => {
  const list = getCurrentCommunityList();
  schema.parse(list);
});

test("Community List - Validate Correct Bump", async () => {
  const masterList = await getListFromMaster("community-list.json");
  const current = getCurrentCommunityList();
  const bump = getVersionUpgrade(masterList.version, current.version);
  const min = minVersionBump(masterList.tokens, current.tokens);
  assert.ok(
    bump >= min,
    `Version bump needs to be bigger than min. Got: ${
      VersionUpgrade[`${bump}`]
    }, needs=${VersionUpgrade[`${min}`]}`
  );
});

function getCurrentMainList() {
  const data = require("../src/tokenlist.json");
  return data;
}
function getCurrentCommunityList() {
  return require("../src/community-list.json");
}

async function getListFromMaster(name) {
  assert.ok(["tokenlist.json", "community-list.json"].includes(name));
  return new Promise((resolve, reject) =>
    https
      .get(
        `https://raw.githubusercontent.com/verto-dex/tokenlist/main/src/${name}`,
        (res) => {
          let body = "";

          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", () => {
            try {
              let json = JSON.parse(body);
              // do something with JSON
              resolve(json);
            } catch (error) {
              reject(error);
              console.error(error.message);
            }
          });
        }
      )
      .on("error", (error) => {
        reject(error);
        console.error(error.message);
      })
  );
}

test.run();

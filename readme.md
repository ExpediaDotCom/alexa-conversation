# Alexa Conversation: Tests for your Alexa skills

Framework to easily test your Alexa skills functionally by creating a **conversation** with your skill. This framework makes it easy to test your Alexa skill's outputs for a given user input (intent) in different ways. This library is build on top of mocha, so you will need mocha installed in order to run the tests written with this framework,

## Install

### Install `alexa-conversation`

`npm install --save-dev alexa-conversation`

### Install `mocha` (if you don't have it already)

`npm install -g mocha` (you can install it locally too, up to you)

## How to use

In your functional test files, include the `alexa-conversation` package

```js

const conversation = require('alexa-conversation');
const app = require('../../index.js'); // your Alexa skill's main file.

const opts = { // those will be used to generate the requests to your skill
  name: 'Test Conversation',
  appId: 'your-app-id',
  // Either provide your app (app.handler must exist)...
  app: app,
  // ...or pass the handler in directly (for example, if you have a custom handler name)
  handler: app.customHandlerName
  // Other optional parameters. See readme.md
};

// initialize the conversation
conversation(opts)
  .userSays('LaunchIntent') // trigger the first Intent
    .plainResponse // this gives you access to the non-ssml response
	    // asserts that response and reprompt are equal to the given text
      .shouldEqual('Welcome back', 'This is the reprompt')
	    // assert not Equals
      .shouldNotEqual('Wrong answer', 'Wrong reprompt')
 	    // assert that repsonse contains the text
      .shouldContain('Welcome')
  	  // assert that the response matches the given Regular Expression
      .shouldMatch(/Welcome(.*)back/)
	    // fuzzy match, not recommended for production use. See readme.md for more details
      .shouldApproximate('This is an approximate match')
  .userSays('IntentWhichRequiresSlots', {slotOne: 'slotValue'}) // next interaction, this time with a slot.
    .ssmlResponse // access the SSML response
      .shouldMatch(/<say>(Hello|Bye)</say>/)
      .shouldNotMatch(/<say>Wrong answer</say>/)
  .end(); // this will actually run the conversation defined above

```

Again, this module requires `mocha` as a `peerDependency` (make sure you have it installed either globally or locally: run `npm install mocha -g`). After that just run:

```
mocha {path/to/your/test.js}
```

## API

### `conversation(opts: Object)`

Initializes a new `conversation` and returns itself.

#### Non-optional parameters:

- `name` *String*: The name you want this conversation to have (useful for the test reports)
- `app` *Object*: Your Alexa skill main app object (normally what is returned from your `index.js` file). It either needs to expose `app.handler`, or you can pass in a `handler` instead (see below)
- `handler` *Function*: If your app doesn't expose a `handler` method or you want to use a custom handler, you can pass the handler in directly - this will take precedence over `app.handler`
- `appId` *String*: Your Alexa Skill Id in order to build requests that will be accepted by your skill.

#### Optional parameters:

- `sessionId` *String*: Will default to `SessionId.ee2e2123-75dc-4b32-bf87-8633ba72c294` if not provided.
- `fixSpaces` *Boolean*: Defaults to false. If set to true, it will remove any unnecessary spaces form the *actual* responses before performing any assertions against them. Example: double spaces, spaces before comma or other punctuation marks, etc. This can be useful depending on how you build your reponses.
- `userId` *String*: Will default to `amzn1.ask.account.AHEYQEFEHVSPRHPZS4ZKSLDADKC62MMFTEC7MVZ636U56XIFWCFUAJ2Q2RJE47PNDHDBEEMMDTEQXWFSK3OPALF4G2D2QAJW4SDMEI5DCULK5G4R32T76G5SZIWDMJ2ZZQ37UYH2BIXBQ3GIGEBIRW4M4YV5QOQG3JXHB73CTH6AAPYZBOIQE5N3IKUETT54HMTRUX2EILTFGWQ` if not provided.
- `accessToken` *String*: Will default to  `0b42d14150e71fb356f2abc42f5bc261dd18573a86a84aa5d7a74592b505a0b7` if not provided.
- `requestId` *String*: Will default to  `EdwRequestId.33ac9138-640f-4e6e-ab71-b9619b2c2210` if not provided.
- `locale` *String*: Will default to `en-US` if not provided.

### `userSays(intentName: String, slots: Object)`

Specifies what intent to trigger and the optional slots that it needs.

### `ssmlResponse`

Use this member to add checks to the last `SSML` `response` and `reprompt`.

The `response` is taken form the JSON field: `response.outputSpeech.ssml` and the reprompt form the `response.reprompt.outputSpeech.ssml`

### `plainResponse`

Use this member to add checks to the last `plain text` `response` and reprompt. Plain text is the same as the `ssmlResponse` without the markup tags.

### `shouldMatch(expectedSpeechRegex: Regex, expectedRepromptRegex: Regex)`

Will assert that `expectedSpeechRegex` and `expectedRepromptRegex` Strings **match** (`String.match()`) the responses from `plainResponse` or `ssmlResponse`.

This is useful for implementing powerful checks like cases where several responses are valid (i.e. dates, locations, or dynamic conditions like weather, etc.)

### `shouldNotMatch(expectedSpeechRegex: Regex, expectedRepromptRegex: Regex)`

Will assert that `expectedSpeechRegex` and `expectedRepromptRegex` Strings **do not match** (`!String.match()`) the responses from `plainResponse` or `ssmlResponse`.

This is useful for implementing powerful checks like cases where several responses are valid (i.e. dates, locations, or dynamic conditions like weather, etc.)

### `shouldApproximate(expectedSpeech: String, expectedReprompt: String, minFuzzyScore: float)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are approximately the same** as the ones in `ssmlResponse` or `plainResponse` using **fuzzy string matching**. The default minimum fuzzy score to pass the test is `0.85`, you can override it by passing a new value to the call as the 3rd parameter (accepts values from `[0...1]`).

This check is useful if you want to assert `actual` and `expected` are *the same* but discarding small differences like spaces or punctuation marks like full stops or question marks.

Learn more about the fuzzy matcher used: [fuzzyset.js](http://glench.github.io/fuzzyset.js/)

### `shouldNotApproximate(expectedSpeech: String, expectedReprompt: String, minFuzzyScore: float)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are approximately *NOT* the same** as the ones in `ssmlResponse` or `plainResponse` using **fuzzy string matching**. The default minimum fuzzy score to pass the test is `0.85`, you can override it by passing a new value to the call as the 3rd parameter (accepts values from `[0...1]`).

This check is useful if you want to assert `actual` and `expected` are *the same* but discarding small differences like spaces or punctuation marks like full stops or question marks.

Learn more about the fuzzy matcher used: [fuzzyset.js](http://glench.github.io/fuzzyset.js/)

### `shouldEqual(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **equal** the ones in `ssmlResponse` or `plainResponse`.


### `shouldContain(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are contained** the ones in `ssmlResponse` or `plainResponse`.


### `shouldNotEqual(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are not equal** to the ones in `ssmlResponse` or `plainResponse`.


### `shouldNotContain(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are not contained** the ones in `ssmlResponse` or `plainResponse`.


## Debugging & Troubleshooting

To start mocha in debug mode:

```
./node_modules/.bin/mocha debug {path/to/test/file}
```

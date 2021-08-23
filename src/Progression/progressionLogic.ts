export let fileType = "progressionLogic";

// These files are all loaded into the learnflow-sdk layer to be processed
// based on their order in the lifecycle of a trial.

// Exercise Lifecycle:
// OnSessionStart > NodeListeners > Exercise Layer > Listeners > LogFunction
// > Expressions (Repeat at NodeListeners after)

// state values we want to inject into the payload in the exercise layer
export let passWithPayload = require("./progressionCallbacks/passWithPayload.json");

// Initial values of the state object that provide default values for the attributes
export { default as initialState } from "./progressionCallbacks/InitialState";

// HelperFunctions is a list of helper methods that can be utilized by the progression
// side to handle shared logic.
export { helperFunctions } from "./progressionCallbacks/HelperFunctions";

// OnSessionStart is called when the exercise app first loads and is never called
// again. It is useful for handling reset/re-entry feature and changes to the state
export { onSessionStart } from "./progressionCallbacks/OnSessionStart";

// NodeListeners are callback functions that are called before a node is opened.
// It is driven by the node id and requires it to match for the node callback to
// be called.
export { nodeListeners } from "./progressionCallbacks/NodeListeners";

// Listeners are callback functions that is called after a trial has accepted
// input from the user, but before processing/posting and going to the next trial
export { listeners } from "./progressionCallbacks/Listeners";

// LogFunction is called after a trial to modify the logObj in state with
// data write out changes. The object along with the state is then posted
// to the server
export { logFunction } from "./progressionCallbacks/LogFunction";

// alerts is a feature used in Foundation exercises, check with the exercise
// doc to see if its needed
export { ALERT_STAGES } from "../MagicRabbit/model/ProgressionTypes";

// Uncomment this line of code here and expand/modify the classes referenced
// in the NodeReference class to allow for the ability to develop your own
// progression content nodes. This can be used instead of the sdk nodes, however,
// they can be both be utilized in the same content.yaml as long as the class
// names are not the same.
// Look at Jen's Houndini exercise repo for reference as that is utilizing this
// approach.
// Please also delete this line and the nodes directory if you don't plan on
// using this exercise level node approach.
export { default as nodes } from "./nodes/NodeReference";

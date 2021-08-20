import Status from "@scilearn/learnflow-sdk/lib/Tree/Status";

export let nodeListeners = [
	{
		id: ["B_1", "B_2"],
		callback: (state, node, status, payload, helperFunctions) => {
			// Why are you using a separate state variable to detect gameOver?
			// -
			switch (status) {
				case Status.SUCCESS:
					if (node.id == "B_2") {
						state.set("GamePlayComplete", true);
					}
					if (node.id == "B_1") {
						state.set("TutorialComplete", true);
					}
					break;
				default:
					break;
			}
		},
	},
];

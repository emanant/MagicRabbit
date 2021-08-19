import { TouchEventWrapper, GameButtonState, FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { Observable } from "rxjs/Rx";

/**
 * @interface IGoButton
 * interface for GoButton.
 */
export default interface IGoButton {
    observable: Observable<TouchEventWrapper> | null;
    buttonState: GameButtonState;
    bindKeyboard(key: number[] | null): void;
    setUp(): void;
}

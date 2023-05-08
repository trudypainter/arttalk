import { FeedbackType } from "~/constants/constant";

export class AudioFeedback {
  public isFeedbackSpoken = false;
  private isSpeaking = false;
  private synth: SpeechSynthesis | null = null;
  public transitionEnabled = false;
  private feedback: FeedbackType;

  constructor(feedback: FeedbackType) {
    this.feedback = feedback;
  }

  public setFeedback(feedback: FeedbackType) {
    if (feedback.description !== this.feedback.description) {
      this.transitionEnabled = false;
      this.isFeedbackSpoken = false;
      this.isSpeaking = false;
    }
    this.feedback = feedback;
  }

  private getVoice(): SpeechSynthesisVoice | undefined {
    this.synth = window.speechSynthesis;
    // AWS Polly voice
    const voiceURI = "urn:aws:polly:us-east-1:216483891305:voice/Joanna";

    // Find the voice in the available voices list
    const availableVoices = this.synth.getVoices();
    const voice = availableVoices.find((voice) => voice.voiceURI === voiceURI);

    if (!voice) {
      console.error(`Voice ${voiceURI} not found.`);
      return availableVoices[0];
    }

    return voice;
  }

  private speakWithDelay(text: string, delay: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.synth) {
        console.error("SpeechSynthesis is not supported in this browser.");
        reject();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getVoice();
      if (voice !== undefined) {
        utterance.voice = voice;
      }
      this.isSpeaking = true;

      setTimeout(() => {
        this.synth = window.speechSynthesis;
        this.synth.speak(utterance);
        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
          this.transitionEnabled = true;
        };
      }, delay);
    });
  }

  public speakFeedback(text: string | undefined = undefined) {
    const feedbackDescription = text ? text : this.feedback.description;

    if (!this.isSpeaking && !this.isFeedbackSpoken) {
      if (!text) {
        this.isFeedbackSpoken = true;
      }
      this.speakWithDelay(feedbackDescription, 1000);
    }
  }
}

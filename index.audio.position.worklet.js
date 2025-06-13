/**************************************************************************/
/*  godot.audio.position.worklet.js                                                      */
/**************************************************************************/
/*                         This file is part of:                          */
/*                             GODOT ENGINE                               */
/*                        https://godotengine.org                         */
/**************************************************************************/
/* Copyright (c) 2014-present Godot Engine contributors (see AUTHORS.md). */
/* Copyright (c) 2007-2014 Juan Linietsky, Ariel Manzur.                  */
/*                                                                        */
/* Permission is hereby granted, free of charge, to any person obtaining  */
/* a copy of this software and associated documentation files (the        */
/* "Software"), to deal in the Software without restriction, including    */
/* without limitation the rights to use, copy, modify, merge, publish,    */
/* distribute, sublicense, and/or sell copies of the Software, and to     */
/* permit persons to whom the Software is furnished to do so, subject to  */
/* the following conditions:                                              */
/*                                                                        */
/* The above copyright notice and this permission notice shall be         */
/* included in all copies or substantial portions of the Software.        */
/*                                                                        */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,        */
/* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF     */
/* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. */
/* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY   */
/* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,   */
/* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE      */
/* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                 */
/**************************************************************************/

const POST_THRESHOLD_S = 0.1;

class GodotPositionReportingProcessor extends AudioWorkletProcessor {
	constructor(...args) {
		super(...args);
		this.lastPostTime = currentTime;
		this.position = 0;
		this.ended = false;

		this.port.onmessage = (event) => {
			if (event?.data?.type === 'ended') {
				this.ended = true;
			}
		};
	}

	process(inputs, _outputs, _parameters) {
		if (this.ended) {
			return false;
		}

		if (inputs.length > 0) {
			const input = inputs[0];
			if (input.length > 0) {
				this.position += input[0].length;
			}
		}

		// Posting messages is expensive. Let's limit the number of posts.
		if (currentTime - this.lastPostTime > POST_THRESHOLD_S) {
			this.lastPostTime = currentTime;
			this.port.postMessage({ type: 'position', data: this.position });
		}

		return true;
	}
}

registerProcessor('godot-position-reporting-processor', GodotPositionReportingProcessor);

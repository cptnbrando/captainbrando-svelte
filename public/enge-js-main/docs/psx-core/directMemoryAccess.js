(scope => {

	'use strict';

	const dma = {
		dpcr: 0,
		dicr: 0,

		r1080: 0, r1084: 0, r1088: 0, r1080n: 0,
		r1090: 0, r1094: 0, r1098: 0, r1090n: 0,
		r10a0: 0, r10a4: 0, r10a8: 0, r10a0n: 0,
		r10b0: 0, r10b4: 0, r10b8: 0, r10b0n: 0,
		r10c0: 0, r10c4: 0, r10c8: 0, r10c0n: 0,
		r10e0: 0, r10e4: 0, r10e8: 0, r10e0n: 0,

		eventDMA0: null,
		completeDMA0: function (self, clock) {
			this.r1088 &= 0xfeffffff;
			this.r1080 = this.r1080n;
			if (dma.dicr & 0x00010000) {
				dma.dicr |= 0x81000000;
				cpu.istat |= 0x0008;
			}
			psx.unsetEvent(self);
		},

		eventDMA1: null,
		completeDMA1: function (self, clock) {
			this.r1098 &= 0xfeffffff;
			this.r1090 = this.r1090n;
			if (dma.dicr & 0x00020000) {
				dma.dicr |= 0x82000000;
				cpu.istat |= 0x0008;
			}
			psx.unsetEvent(self);
		},

		eventDMA2: null,
		completeDMA2: function (self, clock) {
			this.r10a8 &= 0xfeffffff;
			this.r10a0 = this.r10a0n;
			if (dma.dicr & 0x00040000) {
				dma.dicr |= 0x84000000;
				cpu.istat |= 0x0008;
			}
			psx.unsetEvent(self);
		},

		eventDMA3: null,
		completeDMA3: function (self, clock) {
			this.r10b8 &= 0xfeffffff;
			this.r10b0 = this.r10b0n;
			if (dma.dicr & 0x00080000) {
				dma.dicr |= 0x88000000;
				cpu.istat |= 0x0008;
			}
			psx.unsetEvent(self);
		},

		eventDMA4: null,
		completeDMA4: function (self, clock) {
			this.r10c8 &= 0xfeffffff;
			this.r10c0 = this.r10c0n;
			if (dma.dicr & 0x00100000) {
				dma.dicr |= 0x90000000;
				cpu.istat |= 0x0008;
			}
			psx.unsetEvent(self);
		},

		eventDMA6: null,
		completeDMA6: function (self, clock) {
			this.r10e8 &= 0xfeffffff;
			this.r10e0 = this.r10e0n;
			if (dma.dicr & 0x00400000) {
				dma.dicr |= 0xC0000000;
				cpu.istat |= 0x0008;
			}
			psx.unsetEvent(self);
		},

		rd08r10f6: function () {
			return (dma.dicr >> 16) & 0xff;
		},

		rd16r10f0: function () {
			return dma.dpcr & 0xffff;
		},

		rd32r10f0: function () {
			return dma.dpcr;
		},

		rd32r10f4: function () {
			// faulty needs more
			//IF b15=1 OR (b23=1 AND (b16-22 AND b24-30)>0) THEN b31=1 ELSE b31=0
			return dma.dicr & 0x7fffffff;
		},

		wr32r10f0: function (data) {
			dma.dpcr = data;
		},

		wr08r10f6: function (data) {
			data = (data << 16) | (dma.dicr & 0xffff);
			dma.dicr = (dma.dicr & (~((data & 0x7f000000) | 0x00ffffff))) | (data & 0x00ffffff);
		},

		wr32r10f4: function (data) {
			dma.dicr = (dma.dicr & (~((data & 0x7f000000) | 0x00ffffff))) | (data & 0x00ffffff);
		},

		wr32r1088: function (ctrl) {
			this.r1088 = ctrl;
			if (dma.dpcr & 0x00000008) {
				let transferSize = 10;

				switch (ctrl) {
					case 0x00000000: break;
					case 0x01000201: transferSize = mdc.dmaTransferMode0201(this.r1080, this.r1084);
						this.r1080n = this.r1080 + (transferSize << 2);
						break;

					default: abort('mdi-ctrl:' + hex(ctrl));
				}

				psx.setEvent(this.eventDMA0, ((transferSize * 0x110) / 0x100) >>> 0);
			}
			else {
				this.r1088 &= 0xfeffffff;
			}
		},

		wr32r1098: function (ctrl) {
			this.r1098 = ctrl;
			if (dma.dpcr & 0x00000080) {
				let transferSize = 10;

				switch (ctrl) {
					case 0x00000000: break;
					case 0x01000200: transferSize = mdc.dmaTransferMode0200(this.r1090, this.r1094);
						this.r1090n = this.r1090 + (transferSize << 2);
						break;

					default: abort('mdo-ctrl:' + hex(ctrl));
				}

			}
			else {
				this.r1098 &= 0xfeffffff;
			}
		},

		wr32r10a8: function (ctrl) {
			this.r10a8 = ctrl;
			if (dma.dpcr & 0x00000800) {
				let transferSize = 10;

				switch (ctrl) {
					case 0x00000000: break;
					case 0x00000001: break;
					case 0x00000401: break;
					case 0x01000200: transferSize = gpu.dmaTransferMode0200(this.r10a0, this.r10a4) || 10;
						this.r10a0n = this.r10a0 + (transferSize << 2);
						break;
					case 0x01000201: transferSize = gpu.dmaTransferMode0201(this.r10a0, this.r10a4) || 10;
						this.r10a0n = this.r10a0 + (transferSize << 2);
						break;
					case 0x01000401: transferSize = gpu.dmaTransferMode0401(this.r10a0, this.r10a4) || 10;
						this.r10a0n = 0x00ffffff;
						break;

					default: abort('gpu-ctrl:' + hex(ctrl));
				}

				psx.setEvent(this.eventDMA2, ((transferSize * 0x110) / 0x100) >>> 0);
			}
			else {
				this.r10a8 &= 0xfeffffff;
			}
		},

		wr32r10b8: function (ctrl) {
			this.r10b8 = ctrl;
			if (dma.dpcr & 0x00008000) {
				let transferSize = 10;

				switch (ctrl) {
					case 0x00000000: break;
					case 0x11000000: transferSize = cdr.dmaTransferMode0000(this.r10b0, this.r10b4);
						this.r10b0n = this.r10b0 + (transferSize << 2);
						break;
					case 0x11400100: transferSize = cdr.dmaTransferMode0000(this.r10b0, this.r10b4);
						this.r10b0n = this.r10b0 + (transferSize << 2);
						break;

					default: abort('cd-ctrl:' + hex(ctrl));
				}

				psx.setEvent(this.eventDMA3, ((transferSize * (cdr.mode & 0x80) ? 0x1400 : 0x2800) / 0x100) >>> 0);
			}
			else {
				this.r10b8 &= 0xfeffffff;
			}
		},

		wr32r10c8: function (ctrl) {
			this.r10c8 = ctrl;
			if (dma.dpcr & 0x00080000) {
				let transferSize = 10;

				switch (ctrl) {
					case 0x01000000:
					case 0x01000200: transferSize = spu.dmaTransferMode0200(this.r10c0, this.r10c4);
						this.r10c0n = this.r10c0 + (transferSize << 2);
						break;
					case 0x01000001:
					case 0x01000201: transferSize = spu.dmaTransferMode0201(this.r10c0, this.r10c4);
						this.r10c0n = this.r10c0 + (transferSize << 2);
						break;

					default: abort('spu-ctrl:' + hex(ctrl));
				}

				psx.setEvent(this.eventDMA4, ((transferSize * 0x420) / 0x100) >>> 0);
			}
			else {
				this.r10c8 &= 0xfeffffff;
			}
		},

		wr32r10e8: function (ctrl) {
			this.r10e8 = (ctrl & 0x50000002) | 0x2;
			if (dma.dpcr & 0x08000000) {
				let transferSize = 10;

				switch (this.r10e8) {
					case 0x00000002: this.r10e0n = this.r10e0 = map[(this.r10e0 & 0x01ffffff) >> 2];
						break;
					case 0x10000002:
					case 0x50000002: transferSize = gpu.dmaLinkedListMode0002(this.r10e0, this.r10e4);
						this.r10e0n = 0x00ffffff;
						break;

					default: abort('otc-ctrl:' + hex(ctrl) + ' ' + hex(this.r10e8));
				}

				psx.setEvent(this.eventDMA6, ((transferSize * 0x110) / 0x100) >>> 0);
			}
			else {
				this.r10e8 &= 0xfeffffff;
			}
		},
	}

	scope.dma = Object.seal(dma);

})(window);
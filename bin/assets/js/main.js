/**
 * Component: Form Generator
 * Handles user input for BIN, Quantity, Date, CVV
 */
Vue.component('form-generator', {
    template: `
    <div class="form-container">
        <div class="row" style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div class="form-group" style="flex: 2; min-width: 200px;">
                <label>BIN (First 6-16 digits)</label>
                <input v-model="bin" type="text" placeholder="e.g. 453598" maxlength="16" @input="filterBin">
            </div>
            <div class="form-group" style="flex: 1; min-width: 100px;">
                <label>Quantity</label>
                <input v-model.number="quantity" type="number" min="1" max="100">
            </div>
        </div>

        <div class="row" style="display: flex; gap: 20px; flex-wrap: wrap;">
             <div class="form-group" style="flex: 1;">
                <label>Month</label>
                <select v-model="month">
                    <option value="Random">Random</option>
                    <option v-for="m in 12" :value="formatMonth(m)">{{ formatMonth(m) }}</option>
                </select>
            </div>
             <div class="form-group" style="flex: 1;">
                <label>Year</label>
                <select v-model="year">
                    <option value="Random">Random</option>
                    <option v-for="y in 10" :value="currentYear + y - 1">{{ currentYear + y - 1 }}</option>
                </select>
            </div>
             <div class="form-group" style="flex: 1;">
                <label>CVV</label>
                <input v-model="cvv" type="text" placeholder="Random" maxlength="4">
            </div>
        </div>

        <button class="generate-btn" @click="generateCards">
            <i class="fas fa-cogs"></i> Generate Cards
        </button>
    </div>
    `,
    data() {
        return {
            bin: '',
            quantity: 10,
            month: 'Random',
            year: 'Random',
            cvv: '',
            currentYear: new Date().getFullYear()
        }
    },
    methods: {
        filterBin() {
            this.bin = this.bin.replace(/[^0-9]/g, '');
        },
        formatMonth(m) {
            return m < 10 ? '0' + m : '' + m;
        },
        generateCards() {
            if (this.bin.length < 6) {
                alert('Please enter at least 6 digits for the BIN');
                return;
            }

            this.$root.$emit('generate-cards', {
                bin: this.bin,
                quantity: this.quantity,
                month: this.month,
                year: this.year,
                cvv: this.cvv
            });
        }
    }
});

/**
 * Component: Generated Credit Cards
 * Displays the list of generated cards
 */
Vue.component('generated-credit-cards', {
    template: `
    <div class="generated-cards-list" v-if="generatedCreditCards.length > 0">
        <textarea id="generatedCardsArea" readonly class="form-control" style="width:100%; height: 300px; padding: 15px; border-radius: 8px; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); font-family: monospace; white-space: pre;">{{ cardsString }}</textarea>
    </div>
    `,
    data() {
        return {
            generatedCreditCards: []
        }
    },
    computed: {
        cardsString() {
            return this.generatedCreditCards.map(c => `${c.number}|${c.month}|${c.year}|${c.cvv}`).join('\n');
        }
    },
    created() {
        this.$root.$on('generate-cards', this.onGenerate);
    },
    methods: {
        onGenerate(data) {
            this.generatedCreditCards = [];
            for (let i = 0; i < data.quantity; i++) {
                this.generatedCreditCards.push(this.generateSingleCard(data));
            }
        },
        generateSingleCard(data) {
            // 1. Generate Number
            let number = data.bin;
            // Pad with random digits until 15 (length - 1)
            while (number.length < 15) {
                number += Math.floor(Math.random() * 10);
            }
            // Calculate Check Digit
            const checkDigit = this.generateCheckDigit(number);
            number += checkDigit;

            // 2. Generate Date
            let month = data.month;
            if (month === 'Random') {
                const m = Math.floor(Math.random() * 12) + 1;
                month = m < 10 ? '0' + m : '' + m;
            }

            let year = data.year;
            if (year === 'Random') {
                const currentY = new Date().getFullYear();
                year = currentY + Math.floor(Math.random() * 5); // Next 5 years
            }
            // Simple logic: if random year is current year, ensure month is not in past? 
            // Skipping for simplicity or added later if needed.

            // 3. Generate CVV
            let cvv = data.cvv;
            if (!cvv) {
                cvv = Math.floor(Math.random() * 900) + 100; // 100-999
            }

            return {
                number: number,
                month: month,
                year: year,
                cvv: cvv
            };
        },
        generateCheckDigit(number) {
            let sum = 0;
            let doubleUp = true;

            // Luhn Algorithm from right to left (excluding the check digit position)
            // Since we know length is 15 coming in, let's reverse to make it standard
            const digits = number.split('').reverse().map(Number);

            for (let i = 0; i < digits.length; i++) {
                let digit = digits[i];
                if (doubleUp) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                doubleUp = !doubleUp;
            }

            return (Math.ceil(sum / 10) * 10) - sum;
        }
    }
});

// App Initialization
new Vue({
    el: '#app'
});

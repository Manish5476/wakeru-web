import test from 'node:test';
import assert from 'node:assert/strict';

interface UpiPaymentParams {
  vpa: string;
  payeeName: string;
  amount: number;
  note?: string;
  currency?: string;
}

function generateUpiUri(params: UpiPaymentParams): string {
  const currency = params.currency || 'INR';
  const query = new URLSearchParams({
    pa: params.vpa,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: currency,
  });

  if (params.note) {
    query.set('tn', params.note);
  }

  return `upi://pay?${query.toString()}`;
}

test('Settlement UPI - Generates valid standardized UPI deep link', () => {
  const link = generateUpiUri({
    vpa: 'alex@okhdfcbank',
    payeeName: 'Alex Traveler',
    amount: 1250.5,
    note: 'Settlement for Goa Villa share',
  });

  assert.match(link, /^upi:\/\/pay\?/);
  assert.match(link, /pa=alex%40okhdfcbank/);
  assert.match(link, /pn=Alex\+Traveler/);
  assert.match(link, /am=1250.50/);
  assert.match(link, /cu=INR/);
  assert.match(link, /tn=Settlement\+for\+Goa\+Villa\+share/);
});

test('Settlement UPI - Defaults to INR currency when omitted', () => {
  const link = generateUpiUri({
    vpa: 'user@paytm',
    payeeName: 'Rohan Sharma',
    amount: 500,
  });

  assert.match(link, /cu=INR/);
  assert.doesNotMatch(link, /tn=/);
});

export const cardMap: Record<number, { suit: string; value: number }> = {
    1: { suit: "♥", value: 2 },
    2: { suit: "♥", value: 3 },
    3: { suit: "♥", value: 4 },
    4: { suit: "♥", value: 5 },
    5: { suit: "♥", value: 6 },
    6: { suit: "♥", value: 7 },
    7: { suit: "♥", value: 8 },
    8: { suit: "♥", value: 9 },
    9: { suit: "♥", value: 10 },
    10: { suit: "♥", value: 11 },
    11: { suit: "♥", value: 12 },
    12: { suit: "♥", value: 13 },
    13: { suit: "♥", value: 14 },
    14: { suit: "♦", value: 2 },
    15: { suit: "♦", value: 3 },
    16: { suit: "♦", value: 4 },
    17: { suit: "♦", value: 5 },
    18: { suit: "♦", value: 6 },
    19: { suit: "♦", value: 7 },
    20: { suit: "♦", value: 8 },
    21: { suit: "♦", value: 9 },
    22: { suit: "♦", value: 10 },
    23: { suit: "♦", value: 11 },
    24: { suit: "♦", value: 12 },
    25: { suit: "♦", value: 13 },
    26: { suit: "♦", value: 14 },
    27: { suit: "♠", value: 2 },
    28: { suit: "♠", value: 3 },
    29: { suit: "♠", value: 4 },
    30: { suit: "♠", value: 5 },
    31: { suit: "♠", value: 6 },
    32: { suit: "♠", value: 7 },
    33: { suit: "♠", value: 8 },
    34: { suit: "♠", value: 9 },
    35: { suit: "♠", value: 10 },
    36: { suit: "♠", value: 11 },
    37: { suit: "♠", value: 12 },
    38: { suit: "♠", value: 13 },
    39: { suit: "♠", value: 14 },
    40: { suit: "♣", value: 2 },
    41: { suit: "♣", value: 3 },
    42: { suit: "♣", value: 4 },
    43: { suit: "♣", value: 5 },
    44: { suit: "♣", value: 6 },
    45: { suit: "♣", value: 7 },
    46: { suit: "♣", value: 8 },
    47: { suit: "♣", value: 9 },
    48: { suit: "♣", value: 10 },
    49: { suit: "♣", value: 11 },
    50: { suit: "♣", value: 12 },
    51: { suit: "♣", value: 13 },
    52: { suit: "♣", value: 14 },
  };
  
  export function displayValue(value: number) {
    if (value === 11) return "J";
    if (value === 12) return "Q";
    if (value === 13) return "K";
    if (value === 14) return "A";
    return value.toString();
  }
  
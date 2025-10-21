/**
 * 로또 6/45 확률 계산 프로그램
 * - 1등: 6개 번호 일치
 * - 2등: 5개 번호 일치 + 보너스 번호
 * - 3등: 5개 번호 일치
 * - 4등: 4개 번호 일치
 * - 5등: 3개 번호 일치
 */
public class lotto {
    public static void main(String[] args) {
        System.out.println("=== 로또 6/45 당첨 확률 계산 ===\n");
        
        // 전체 조합의 수: 45개 중 6개 선택 = 45C6
        long totalCombinations = combination(45, 6);
        System.out.println("전체 가능한 조합의 수: " + formatNumber(totalCombinations));
        System.out.println("=" .repeat(50) + "\n");
        
        // 1등: 6개 모두 일치
        calculatePrize("1등 (6개 일치)", 
                       combination(6, 6) * combination(39, 0), 
                       totalCombinations);
        
        // 2등: 5개 일치 + 보너스 번호
        calculatePrize("2등 (5개 일치 + 보너스)", 
                       combination(6, 5) * combination(1, 1) * combination(38, 0), 
                       totalCombinations);
        
        // 3등: 5개 일치
        calculatePrize("3등 (5개 일치)", 
                       combination(6, 5) * combination(38, 1), 
                       totalCombinations);
        
        // 4등: 4개 일치
        calculatePrize("4등 (4개 일치)", 
                       combination(6, 4) * combination(39, 2), 
                       totalCombinations);
        
        // 5등: 3개 일치
        calculatePrize("5등 (3개 일치)", 
                       combination(6, 3) * combination(39, 3), 
                       totalCombinations);
        
        // 낙첨 확률
        long winningCases = combination(6, 6) * combination(39, 0) 
                          + combination(6, 5) * combination(1, 1) * combination(38, 0)
                          + combination(6, 5) * combination(38, 1)
                          + combination(6, 4) * combination(39, 2)
                          + combination(6, 3) * combination(39, 3);
        long losingCases = totalCombinations - winningCases;
        
        System.out.println("=" .repeat(50));
        calculatePrize("낙첨", losingCases, totalCombinations);
        
        // 요약 정보
        System.out.println("\n" + "=" .repeat(50));
        System.out.println("💡 로또 당첨 꿀팁:");
        System.out.println("  - 1등 당첨 확률은 약 814만분의 1");
        System.out.println("  - 5등(3개 일치) 확률이 가장 높음 (약 1.8%)");
        System.out.println("  - 낙첨 확률: 약 " + String.format("%.1f%%", (losingCases * 100.0 / totalCombinations)));
        System.out.println("=" .repeat(50));
    }
    
    /**
     * 조합 계산: nCr = n! / (r! * (n-r)!)
     */
    private static long combination(int n, int r) {
        if (r > n) return 0;
        if (r == 0 || r == n) return 1;
        if (r > n - r) r = n - r; // 최적화: C(n,r) = C(n, n-r)
        
        long result = 1;
        for (int i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }
    
    /**
     * 당첨 확률 출력
     */
    private static void calculatePrize(String prizeName, long cases, long total) {
        double probability = (cases * 100.0) / total;
        double odds = (double) total / cases;
        
        System.out.printf("%-25s\n", prizeName);
        System.out.printf("  경우의 수: %,15d\n", cases);
        System.out.printf("  확률:      %15.10f%%\n", probability);
        System.out.printf("  당첨 비율: 1 / %,.0f\n", odds);
        System.out.println();
    }
    
    /**
     * 숫자 포맷팅 (천 단위 구분)
     */
    private static String formatNumber(long number) {
        return String.format("%,d", number);
    }
}

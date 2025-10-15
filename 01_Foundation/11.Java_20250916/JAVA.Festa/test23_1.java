public class test23_1 {
    public static void main(String[] args) {
        int[][] arr = {
            {1, 2, 3, 4, 5},
            {6, 7, 8, 9, 10},
            {11, 12, 13, 14, 15},
            {16, 17, 18, 19, 20},
            {21, 22, 23, 24, 25}
        };

        int N = arr.length;

        System.out.println("원본");
        for(int i = 0; i < arr.length; i++ ){
        
            for(int j = 0; j < N; j++ ){
            
                System.out.print(arr[i][j] + "\t");
            }
            System.out.println();
        }

        System.out.println("90도 회전");
        for(int j = arr.length - 1 ; j >= 0; j--){       
            for (int i = 0; i < arr.length; i++) {
                System.out.print(arr[i][j] + "\t");
                
            }
            System.out.println();
        }

    }
}

import java.util.*;
public class Main
{
  public static void main(String[] args) 
  {
    Scanner sc=new Scanner(System.in);
    //getting the number of elements
    int n=sc.nextInt();

    //creating two lists to store the ordered and unordered lists

    List<Integer>stable=new ArrayList<>();
    List<Integer>unstable=new ArrayList<>();

    for(int i=0;i<n;i++)
    {
      //getting the number
      int num=sc.nextInt();
      int tmp=num;
      //defining a map to store the occurences of each digit in a number and a set to check 
      Set<Integer>set=new HashSet<>();
      Map<Integer,Integer>map=new HashMap<>();

      //traversing all the numbers

      while(tmp>0)
      {
        int rem=tmp%10;
        tmp/=10;
        map.put(rem,map.getOrDefault(rem,0)+1);
      }
      set.addAll(map.values());
      
      if(set.size()==1)
        stable.add(num);
      else
        unstable.add(num);
    }

    System.out.println("Maximum of all stable numbers + Minimum of all stable numbers = "+(Collections.max(stable)+Collections.min(stable)));
    System.out.println("Minimum of all stable numbers + Maximum of all unstable numbers = "+(Collections.min(stable)+Collections.max(unstable)));
  }
}
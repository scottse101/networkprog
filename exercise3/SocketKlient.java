import java.io.*;
import java.net.*;
import java.util.Locale;
import java.util.Scanner;
class SocketKlient {
  public static void main(String[] args) throws IOException {
    final int PORTNR = 1250;

    /* Bruker en scanner til å lese fra kommandovinduet */
    Scanner leserFraKommandovindu = new Scanner(System.in);
    System.out.print("Oppgi navnet på maskinen der tjenerprogrammet kjører: ");
    String tjenermaskin = leserFraKommandovindu.nextLine();

    /* Setter opp forbindelsen til tjenerprogrammet */
    Socket forbindelse = new Socket(tjenermaskin, PORTNR);
    System.out.println("Nå er forbindelsen opprettet.");

    /* Åpner en forbindelse for kommunikasjon med tjenerprogrammet */
    InputStreamReader leseforbindelse = new InputStreamReader(forbindelse.getInputStream());
    BufferedReader leseren = new BufferedReader(leseforbindelse);
    PrintWriter skriveren = new PrintWriter(forbindelse.getOutputStream(), true);

    /* Leser innledning fra tjeneren og skriver den til kommandovinduet */
    String innledning1 = leseren.readLine();
    String innledning2 = leseren.readLine();
    System.out.println(innledning1 + "\n" + innledning2);

    boolean fortsett = true;
    while (fortsett) {
        /*Leser input fra brukeren og sender til tjeneren*/
        System.out.println("Skriv det første tallet: ");
        double tall1 = leserFraKommandovindu.nextDouble();
        System.out.println("Skriv det andre tallet: ");
        double tall2 = leserFraKommandovindu.nextDouble();
        leserFraKommandovindu.nextLine();

        /* Bruker velger å addere eller subtrahere */
        System.out.println("Velg operasjon (+ eller -): ");
        String operasjon = leserFraKommandovindu.nextLine();

        /* Sender input til tjeneren */
        skriveren.println(tall1);
        skriveren.println(tall2);
        skriveren.println(operasjon);

        /* Mottar resultat fra tjeneren og skriver det til kommandovinduet */
        String respons = leseren.readLine();
        System.out.println("Resultatet fra tjeneren er: " + respons);

        /* Spør brukeren om han vil fortsette */
        System.out.println("Vil du gjøre en ny beregning? (ja/nei)");
        String svar = leserFraKommandovindu.nextLine().toLowerCase();
        if (svar.equals("nei")) {
            fortsett = false;
        }
    }
        /* Lukker forbindelsen */
        leseren.close();
        skriveren.close();
        forbindelse.close();
    }
  }


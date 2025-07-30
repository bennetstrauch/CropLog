package spring.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity @Data
@Table(name = "users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @Column(unique = true)
    String name;
    @Column(unique = true)
    String email;
    String password;


    @OneToMany( mappedBy = "user", cascade = CascadeType.REMOVE)
    List<Crop> crops;

    @OneToMany( mappedBy = "user", cascade = CascadeType.REMOVE)
    List<HarvestField> harvestFields;




}

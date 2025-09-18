package harvestLog.repository;

import harvestLog.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FieldRepository extends JpaRepository<Field, Long> {
    List<Field> findByFarmerId(Long farmerId);

    Optional<Field> findByNameIgnoreCaseAndFarmerId(String name, Long farmerId);

    @Modifying
    @Query("DELETE FROM Field f WHERE f.id IN :ids AND f.farmer.id = :farmerId")
    int deleteByIdInAndFarmerId(@Param("ids") List<Long> ids, @Param("farmerId") Long farmerId);

}
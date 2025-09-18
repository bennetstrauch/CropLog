package harvestLog.repository;

import harvestLog.model.MeasureUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MeasureUnitRepository extends JpaRepository<MeasureUnit, Long> {
    Optional<MeasureUnit> findByNameIgnoreCase(String name);

    List<MeasureUnit> findAllByFarmer_Id(Long farmerId);

    @Modifying
    @Query("DELETE FROM MeasureUnit m WHERE m.id IN :ids AND m.farmer.id = :farmerId")
    int deleteByIdInAndFarmerId(@Param("ids") List<Long> ids, @Param("farmerId") Long farmerId);
}
